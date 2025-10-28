import { BatchFilterDto } from "../dto/batch-filter.dto";
import { CreateBatchDto } from "../dto/create-batch.dto";
import { UpdateBatchDto } from "../dto/update-batch.dto";
import { BatchEntity } from "../entities/batch.entity";


export interface IBatchRepository {
  create(data: CreateBatchDto): Promise<BatchEntity>;
  findAll(filter?: BatchFilterDto): Promise<BatchEntity[]>;
  findOne(id: number): Promise<BatchEntity | null>;
  update(id: number, data: UpdateBatchDto): Promise<BatchEntity>;
  remove(id: number): void;
  getExpiringSoon(day: number): Promise<BatchEntity[]>;
  updateRemaining(batchId: number, remaining: number): void;
  getBatchAvailable(productId: number): Promise<BatchEntity[]>;
}
