import { IAnimalEventRepository } from "src/modules/animals/interfaces/animal-event-repository.interface";
import { IAnimalRepository } from "src/modules/animals/interfaces/animal-repository.interface";
import { IBatchRepository } from "src/modules/batches/interfaces/batches-repository.interface";
import { ICultureEventRepository } from "src/modules/cultures/interfaces/culture-event-repository.interface";
import { ICultureRepository } from "src/modules/cultures/interfaces/culture-repository.interface";
import { IHarvestRepository } from "src/modules/cultures/interfaces/harvest-repository.interface";
import { IFinancialRepository } from "src/modules/financial/interfaces/financial-repository.interface";
import { IInventoryRepository } from "src/modules/inventory/interfaces/inventory-repository.interface";
import { IProductionBatchRepository } from "src/modules/production/interfaces/production-batch-repository.interface";
import { IProductRepository } from "src/modules/products/interfaces/product-repository.interface";
import { IPurchaseRepository } from "src/modules/purchases/interfaces/purchase-repository.interface";
import { ISaleRepository } from "src/modules/sales/interfaces/sale-repository.interface";

export interface IUnitOfWork {
  executeTransaction<T>(work: (transaction: ITransactionContext) => Promise<T>): Promise<T>;
}

export interface ITransactionContext {
  productRepository: IProductRepository;
  purchaseRepository: IPurchaseRepository;
  financialRepository: IFinancialRepository;
  batchRepository: IBatchRepository;
  inventoryRepository: IInventoryRepository;
  animalRepository: IAnimalRepository;
  animalEventRepository: IAnimalEventRepository;
  cultureRepository: ICultureRepository;
  cultureEventRepository: ICultureEventRepository;
  harvestRepository: IHarvestRepository;
  productionBatchRepository: IProductionBatchRepository;
  saleRepository: ISaleRepository;
}