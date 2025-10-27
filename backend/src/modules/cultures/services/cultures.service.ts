import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { ICultureRepository } from '../interfaces/culture-repository.interface';
import { ICultureEventRepository } from '../interfaces/culture-event-repository.interface';
import { IHarvestRepository } from '../interfaces/harvest-repository.interface';
import { CreateCultureDto } from '../dto/create-culture.dto';
import { CreateHarvestDto } from '../dto/create-harvest.dto';
import { CreateCultureEventDto } from '../dto/create-culture-event.dto';
import { SeedCultureDto } from '../dto/seed-culture.dto';

@Injectable()
export class CulturesService {
  constructor(
    @Inject('ICultureRepository')
    private cultureRepository: ICultureRepository,
    @Inject('ICultureEventRepository')
    private cultureEventRepository: ICultureEventRepository,
    @Inject('IHarvestRepository')
    private harvestRepository: IHarvestRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async findAll(status?: string) {
    return this.cultureRepository.findAll(status);
  }

  async findOne(id: number) {
    const culture = await this.cultureRepository.findById(id);
    if (!culture) {
      throw new NotFoundException(`Culture avec l'ID ${id} non trouvée`);
    }
    return culture;
  }

  async create(createCultureDto: CreateCultureDto) {
    const dto = {
      ...createCultureDto,
      status: createCultureDto.status || 'ongoing',
    };
    return this.cultureRepository.create(dto);
  }

  async harvest(createHarvestDto: CreateHarvestDto) {
    const { cultureId, productId, quantity, date, note } = createHarvestDto;

    return this.unitOfWork.executeTransaction(async (tx) => {
      // 1️⃣ Vérifier que la culture existe
      const culture = await tx.cultureRepository.findById(cultureId);
      if (!culture) {
        throw new NotFoundException(`Culture ${cultureId} introuvable`);
      }

      // 2️⃣ Vérifier que le produit existe
      const product = await tx.productRepository.findOne(productId);
      if (!product) {
        throw new NotFoundException(`Produit ${productId} introuvable`);
      }

      // 3️⃣ Créer la récolte
      const harvest = await tx.harvestRepository.create({
        cultureId,
        productId,
        quantity,
        date: new Date(date),
        note,
      });

      // 4️⃣ Créer un mouvement d'inventaire (IN) pour enregistrer l'entrée en stock
      const movement = await tx.inventoryRepository.createMovement({
        type: 'IN',
        productId,
        quantity,
        date: new Date(date),
        reference: `harvest:${harvest.id}`,
        note: `Récolte de ${product.name} depuis culture ${culture.name}`,
      });

      // 5️⃣ Créer un batch pour cette récolte (coût unitaire = 0 car c'est une production)
      const batch = await tx.batchRepository.create({
        productId,
        quantity,
        unitPrice: 0, // Coût de production à calculer si nécessaire
        receivedAt: new Date(date),
      });

      await tx.batchRepository.updateRemaining(batch.id, quantity);

      return {
        message: `Récolte enregistrée avec succès pour la culture ${culture.name}.`,
        harvest,
        movement,
        batch,
      };
    });
  }

  async update(id: number, updateCultureDto: CreateCultureDto) {
    await this.findOne(id);
    return this.cultureRepository.update(id, updateCultureDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.cultureRepository.delete(id);
  }

  async getEvents(cultureId?: number) {
    return this.cultureEventRepository.findAll(cultureId);
  }

  async getHarvests(cultureId?: number) {
    return this.harvestRepository.findAll(cultureId);
  }

  async createEvent(createEventDto: CreateCultureEventDto) {
    await this.findOne(createEventDto.cultureId);

    return this.unitOfWork.executeTransaction(async (tx) => {
      const event = await tx.cultureEventRepository.create({
        cultureId: createEventDto.cultureId,
        type: createEventDto.type,
        date: createEventDto.date,
        description: createEventDto.description,
        cost: createEventDto.cost || 0,
      });

      // Si l'événement est une récolte finale, marquer la culture comme "harvested"
      if (createEventDto.type === 'harvest') {
        await tx.cultureRepository.update(createEventDto.cultureId, {
          status: 'harvested',
        });
      }

      // Si l'événement a un coût, créer une transaction financière
      if (createEventDto.cost && createEventDto.cost > 0) {
        const culture = await tx.cultureRepository.findById(
          createEventDto.cultureId,
        );

        await tx.financialRepository.create({
          type: 'EXPENSE',
          amount: createEventDto.cost,
          date: createEventDto.date
            ? new Date(createEventDto.date)
            : new Date(),
          note: `${createEventDto.type} - Culture ${culture?.name}`,
        });
      }

      return event;
    });
  }

  async seed(seedCultureDto: SeedCultureDto) {
    const { batchId, quantity, cultureId, date } = seedCultureDto;

    return this.unitOfWork.executeTransaction(async (tx) => {
      // 1️⃣ Récupérer le batch et le produit associé
      const batch = await tx.batchRepository.findOne(batchId);

      if (!batch) {
        throw new NotFoundException(`Batch ${batchId} introuvable`);
      }

      // 2️⃣ Vérifier le stock restant
      if (batch.remaining < quantity) {
        throw new ForbiddenException(
          `Stock insuffisant pour le batch ${batchId}. Disponible: ${batch.remaining}, demandé: ${quantity}`,
        );
      }

      // 3️⃣ Vérifier que la culture existe
      const culture = await tx.cultureRepository.findById(cultureId);
      if (!culture) {
        throw new NotFoundException(`Culture ${cultureId} introuvable`);
      }

      // 4️⃣ Créer le mouvement de stock (OUT)
      const movement = await tx.inventoryRepository.createMovement({
        type: 'OUT',
        productId: batch.productId,
        batchId: batch.id,
        quantity,
        date: new Date(date),
        reference: `seed:${cultureId}`,
        note: `Application de ${batch.product.name} sur culture ${culture.name}`,
      });

      // 5️⃣ Créer un événement pour la culture
      const cultureEvent = await tx.cultureEventRepository.create({
        cultureId,
        type: 'seeding',
        date,
        description: `Semis/Application de ${quantity} ${batch.product.name}`,
        cost: quantity * batch.unitPrice,
      });

      // 6️⃣ Mettre à jour le batch (décrément du stock restant)
      await tx.batchRepository.updateRemaining(batch.id, batch.remaining - quantity);

      // 7️⃣ Créer une transaction financière
      const totalCost = quantity * batch.unitPrice;
      if (totalCost > 0) {
        await tx.financialRepository.create({
          type: 'EXPENSE',
          amount: totalCost,
          date: new Date(date),
          note: `Semis/Intrants culture ${culture.name} - ${batch.product.name}`,
        });
      }

      return {
        message: `Semis/Application effectué avec succès pour la culture ${culture.name}.`,
        quantity,
        movement,
        cultureEvent,
      };
    });
  }
}
