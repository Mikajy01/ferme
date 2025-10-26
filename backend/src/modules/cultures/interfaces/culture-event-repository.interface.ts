import { CreateCultureEventDto } from "../dto/create-culture-event.dto";
import { CultureEventEntity } from "../entities/culture-event.entity";

export interface ICultureEventRepository {
  create(data: CreateCultureEventDto): Promise<CultureEventEntity>;
  findAll(cultureId?: number): Promise<CultureEventEntity[]>;
//   findOne(id: number): Promise<BatchEntity | null>;
//   update(id: number, data: UpdateBatchDto): Promise<BatchEntity>;
//   remove(id: number): void;
//   getExpiringSoon(day: number): Promise<BatchEntity[]>;
//   updateRemaining(batchId: number, remaining: number): void;
}
