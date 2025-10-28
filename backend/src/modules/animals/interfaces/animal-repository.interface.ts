import { CreateAnimalDto } from "../dto/create-animal.dto";
import { AnimalEntity } from "../entities/animal.entity";

export interface IAnimalRepository {
  create(data: CreateAnimalDto): Promise<AnimalEntity>;
  findAll(status?: string): Promise<AnimalEntity[]>;
  findById(id: number): Promise<AnimalEntity | null>;
  update(id: number, data: Partial<CreateAnimalDto>): Promise<AnimalEntity>;
  delete(id: number): void;
  // getExpiringSoon(day: number): Promise<BatchEntity[]>;
  // updateRemaining(batchId: number, remaining: number): void;
}
