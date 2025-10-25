import { IBatchRepository } from "src/modules/batches/interfaces/batches-repository.interface";
import { IFinancialRepository } from "src/modules/financial/interfaces/financial-repository.interface";
import { IInventoryRepository } from "src/modules/inventory/interfaces/inventory-repository.interface";
import { IPurchaseRepository } from "src/modules/purchases/interfaces/purchase-repository.interface";

export interface IUnitOfWork {
  executeTransaction<T>(work: (transaction: ITransactionContext) => Promise<T>): Promise<T>;
}

export interface ITransactionContext {
  purchaseRepository: IPurchaseRepository;
  financialRepository: IFinancialRepository;
  batchRepository: IBatchRepository;
  inventoryRepository: IInventoryRepository;
}