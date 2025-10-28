import { CreateAnimalEventDto } from "../dto/create-animal-event.dto";
import { AnimalEventEntity } from "../entities/animal-event.entity";

export interface IAnimalEventRepository {
  create(data: CreateAnimalEventDto): Promise<AnimalEventEntity>;
  findAll(animalId?: number): Promise<AnimalEventEntity[]>;
  // findOne(id: number): Promise<BatchEntity | null>;
  // update(id: number, data: UpdateBatchDto): Promise<BatchEntity>;
  // remove(id: number): void;
  // getExpiringSoon(day: number): Promise<BatchEntity[]>;
  // updateRemaining(batchId: number, remaining: number): void;
}
