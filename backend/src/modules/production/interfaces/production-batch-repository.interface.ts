import { CreateProductionBatchDto } from "../dto/create-production-batch.dto";
import { ProductionBatchEntity } from "../entities/production-batch.entity";

export interface IProductionBatchRepository {
  create(data: CreateProductionBatchDto): Promise<ProductionBatchEntity>;
  // getStockByProduct(): Promise<number[]>;
  findAll(): Promise<ProductionBatchEntity[]>;
  findById(id: number): Promise<ProductionBatchEntity>;
  updateCostTotal(id: number, costTotal: number): Promise<ProductionBatchEntity>;
  // deleteByReference(reference: string): Promise<void>;
  // findByType(type: string, interval: {startDate?: Date, endDate?: Date}): Promise<FinancialEntity[]>;
}
