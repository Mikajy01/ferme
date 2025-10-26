import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAnimalRepository } from '../interfaces/animal-repository.interface';
import { IAnimalEventRepository } from '../interfaces/animal-event-repository.interface';
import { CreateAnimalDto } from '../dto/create-animal.dto';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { FeedAnimalDto } from '../dto/feed-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(
    @Inject('IAnimalRepository')
    private animalRepository: IAnimalRepository,
    @Inject('IAnimalEventRepository')
    private animalEventRepository: IAnimalEventRepository,
    @Inject('IUnitOfWork')
    private unitOfWork: IUnitOfWork,
  ) {}

  async findAll(status?: string) {
  const animals = await this.animalRepository.findAll(status);
  return animals.map((animal) => {
    const totalExpenses = animal.events.reduce((sum, event) => {
      const cost = Number(event.cost) || 0;
      return sum + cost;
    }, 0) + +animal.buyPrice!;

    return {
      ...animal,
      totalExpenses,
    };
  });
}


  async findOne(id: number) {
    const animal = await this.animalRepository.findById(id);
    if (!animal) {
      throw new NotFoundException(`Animal avec l'ID ${id} non trouvé`);
    }
    return animal;
  }

  async create(createAnimalDto: CreateAnimalDto) {
    return this.animalRepository.create({
      tag: createAnimalDto.tag,
      species: createAnimalDto.species,
      birthDate: createAnimalDto.birthDate ? new Date(createAnimalDto.birthDate).toISOString() : new Date().toISOString(),
      buyPrice: createAnimalDto.buyPrice,
      status: createAnimalDto.status || 'alive',
    });
  }

  async update(id: number, updateAnimalDto: CreateAnimalDto) {
    await this.findOne(id);
    return this.animalRepository.update(id, {
      tag: updateAnimalDto.tag,
      species: updateAnimalDto.species,
      birthDate: updateAnimalDto.birthDate,
      buyPrice: updateAnimalDto.buyPrice,
      status: updateAnimalDto.status,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.animalRepository.delete(id);
  }

  async getEvents(animalId?: number) {
    return this.animalEventRepository.findAll(animalId);
  }

  async createEvent(createEventDto: CreateAnimalEventDto) {
    await this.findOne(createEventDto.animalId);

    return this.unitOfWork.executeTransaction(async (tx) => {
      const event = await tx.animalEventRepository.create(createEventDto);

      if (createEventDto.type === 'sale' || createEventDto.type === 'death') {
        await tx.animalRepository.update(createEventDto.animalId,{ status: createEventDto.type === 'sale' ? 'sold' : 'dead' });
      }

      if (createEventDto.cost && createEventDto.cost > 0) {
        await tx.financialRepository.create({
            type: 'EXPENSE',
            amount: createEventDto.cost,
            date: createEventDto.date
              ? new Date(createEventDto.date)
              : new Date(),
            note: `${createEventDto.type} - Animal ${event.animal.tag || event.animalId}`,
          },
        );
      }

      return event;
    });
  }

  feed(feedAnimalDto: FeedAnimalDto) {
    const { batchId, quantity, animals, date } = feedAnimalDto;

    return this.unitOfWork.executeTransaction(async (tx) => {
      // 1️⃣ Récupérer le batch et le produit associé
      const batch = await tx.batchRepository.findOne(batchId);

      if (!batch) {
        throw new Error(`Batch ${batchId} introuvable`);
      }

      // 2️⃣ Vérifier le stock restant
      if (batch.remaining < quantity) {
        throw new ForbiddenException(
          `Stock insuffisant pour le batch ${batchId}. Disponible: ${batch.remaining}, demandé: ${quantity}`
        );
      }

      // 3️⃣ Calcul de la quantité par animal
      const quantityPerAnimal = quantity / animals.length;

      // 4️⃣ Créer le mouvement de stock global (OUT)
      const movement = await tx.inventoryRepository.createMovement({
          type: 'OUT',
          productId: batch.productId,
          batchId: batch.id,
          quantity,
          date: date ? new Date(date) : new Date(),
          reference: `feed:${batchId}`,
          note: `Distribution d’aliment à ${animals.length} animaux`,
        
      });

      // 5️⃣ Créer un événement pour chaque animal et lier au mouvement
      const animalEvents = await Promise.all(
        animals.map(async (animalId) =>
          tx.animalEventRepository.create({
              animalId,
              type: 'feed',
              date: date ? new Date(date).toISOString() : new Date().toISOString(),
              note: `Nourri avec ${quantityPerAnimal} ${batch.product.name}`,
              cost: quantityPerAnimal * batch.unitPrice,
              inventoryMovementId: movement.id, // 🔗 lien ajouté
            
          }),
        ),
      );

      // 6️⃣ Mettre à jour le batch (décrément du stock restant)
      await tx.batchRepository.updateRemaining(batch.id,
         batch.remaining - quantity
      );

      return {
        message: `Nourrissage effectué avec succès pour ${animals.length} animaux.`,
        totalQuantity: quantity,
        quantityPerAnimal,
        movement,
        animalEvents,
      };
    });
  }
}
