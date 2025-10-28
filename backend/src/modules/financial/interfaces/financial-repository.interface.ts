import { CreateFinancialTransactionDto } from "../dto/create-financial.dto";
import { FinancialEntity } from "../entities/financial.entity";

export interface IFinancialRepository {
  create(data: CreateFinancialTransactionDto): Promise<FinancialEntity>;
  findById(id: number): Promise<FinancialEntity | null>;
  findAll(interval: {startDate?: Date, endDate?: Date}): Promise<FinancialEntity[]>;
  findByType(type: string, interval: {startDate?: Date, endDate?: Date}): Promise<FinancialEntity[]>;
  deleteBySaleId(saleId: number): Promise<void>;
}
