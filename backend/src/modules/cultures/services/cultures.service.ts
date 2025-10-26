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
        date: createEventDto.date ? new Date(createEventDto.date) : new Date(),
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
          note: `${createEventDto.type} - Culture ${culture.name}`,
        });
      }

      return event;
    });
  }
}