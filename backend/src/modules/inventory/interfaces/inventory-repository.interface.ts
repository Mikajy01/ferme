import { CreateInventoryMovementDto } from "../dto/create-inventory-movement.dto";
import { InventoryMovementEntity } from "../entities/inventory.entity";

export interface IInventoryRepository {
  createMovement(data: CreateInventoryMovementDto): Promise<InventoryMovementEntity>;
  getStockByProduct(): Promise<number[]>;
  findAllMovements(productId?: number): Promise<InventoryMovementEntity[]>;
  deleteByReference(reference: string): Promise<void>;
  // findByType(type: string, interval: {startDate?: Date, endDate?: Date}): Promise<FinancialEntity[]>;
}
