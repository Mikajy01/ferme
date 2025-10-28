import { CreateSaleDto } from "../dto/create-sale.dto";
import { SaleEntity } from "../entities/sale.entity";

export interface ISaleRepository {
    findAll(): Promise<SaleEntity[]>;
    findById(id: number): Promise<SaleEntity | null>;
    create(sale: CreateSaleDto, totalAmount: number): Promise<SaleEntity>;
    getTotalSalesByPeriod(startDate?: Date, endDate?: Date): Promise<number>;
    delete(id: number): Promise<void>;
}