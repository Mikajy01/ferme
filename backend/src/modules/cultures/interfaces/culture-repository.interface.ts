import { CreateCultureDto } from "../dto/create-culture.dto";
import { CultureEntity } from "../entities/culture.entity";


export interface ICultureRepository {
  create(data: CreateCultureDto): Promise<CultureEntity>;
  findAll(status?: string): Promise<CultureEntity[]>;
  findById(id: number): Promise<CultureEntity | null>;
  update(id: number, data: Partial<CreateCultureDto>): Promise<CreateCultureDto>;
  delete(id: number): void;
//   getExpiringSoon(day: number): Promise<BatchEntity[]>;
//   updateRemaining(batchId: number, remaining: number): void;
}
