import { CreatePurchaseDto } from "../dto/create-purchase.dto";
import { PurchaseEntity } from "../entities/purchase.entity";

export interface IPurchaseRepository {
  create(data: CreatePurchaseDto, totalAmount: number): Promise<PurchaseEntity>;
  // findBySku(sku: string): Promise<ProductEntity>;
  findAll(): Promise<PurchaseEntity[]>;
  findById(id: number): Promise<PurchaseEntity | null>;
  delete(id: number): Promise<PurchaseEntity>;
  // update(id: number, data: UpdateProductDto): Promise<ProductEntity>;
  // remove(id: number): void;
  // getCurrentStock(id: number): Promise<number>;
}

export const IFinancialRepoToken = Symbol('IFinancialRepository');