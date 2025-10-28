import { Injectable } from '@nestjs/common';
import { ITransactionContext, IUnitOfWork } from '../interfaces/unit-of-work.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaPurchaseRepository } from 'src/modules/purchases/repositories/prisma-purchase.repository';
import { PrismaFinancialTransactionRepository } from 'src/modules/financial/repositories/prisma-financial.repository';
import { PrismaBatchRepository } from 'src/modules/batches/repositories/prisma-batch.repository';
import { PrismaInventoryRepository } from 'src/modules/inventory/repositories/prisma-inventory.repository';
import { PrismaAnimalRepository } from 'src/modules/animals/repositories/prisma-animal.repository';
import { PrismaAnimalEventRepository } from 'src/modules/animals/repositories/prisma-animal-event.repository';
import { PrismaCultureEventRepository } from 'src/modules/cultures/repositories/prisma-culture-event.repository';
import { PrismaCultureRepository } from 'src/modules/cultures/repositories/prisma-culture.repository';
import { PrismaHarvestRepository } from 'src/modules/cultures/repositories/prisma-harvest.repository';
import { PrismaProductsRepository } from 'src/modules/products/repositories/prisma-product.repository';
import { PrismaProductionBatchRepository } from 'src/modules/production/repositories/prisma-production.repository';
import { PrismaSaleRepository } from 'src/modules/sales/repositories/prisma-sale.repository';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private prisma: PrismaService) {}

  async executeTransaction<T>(
    work: (transaction: ITransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (prismaTransaction) => {
      const context: ITransactionContext = {
        productRepository: new PrismaProductsRepository(prismaTransaction),
        purchaseRepository: new PrismaPurchaseRepository(prismaTransaction),
        financialRepository: new PrismaFinancialTransactionRepository(prismaTransaction),
        batchRepository: new PrismaBatchRepository(prismaTransaction),
        inventoryRepository: new PrismaInventoryRepository(prismaTransaction),
        animalRepository: new PrismaAnimalRepository(prismaTransaction),
        animalEventRepository: new PrismaAnimalEventRepository(prismaTransaction),
        cultureEventRepository: new PrismaCultureEventRepository(prismaTransaction),
        cultureRepository: new PrismaCultureRepository(prismaTransaction),
        harvestRepository: new PrismaHarvestRepository(prismaTransaction),
        productionBatchRepository: new PrismaProductionBatchRepository(prismaTransaction),
        saleRepository: new PrismaSaleRepository(prismaTransaction),
      };

      return work(context);
    });
  }
}