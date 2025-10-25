import { Injectable } from '@nestjs/common';
import { ITransactionContext, IUnitOfWork } from '../interfaces/unit-of-work.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaPurchaseRepository } from 'src/modules/purchases/repositories/prisma-purchase.repository';
import { PrismaFinancialTransactionRepository } from 'src/modules/financial/repositories/prisma-financial.repository';
import { PrismaBatchRepository } from 'src/modules/batches/repositories/prisma-batch.repository';
import { PrismaInventoryRepository } from 'src/modules/inventory/repositories/prisma-inventory.repository';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private prisma: PrismaService) {}

  async executeTransaction<T>(
    work: (transaction: ITransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (prismaTransaction) => {
      const context: ITransactionContext = {
        purchaseRepository: new PrismaPurchaseRepository(prismaTransaction),
        financialRepository: new PrismaFinancialTransactionRepository(prismaTransaction),
        batchRepository: new PrismaBatchRepository(prismaTransaction),
        inventoryRepository: new PrismaInventoryRepository(prismaTransaction),
      };

      return work(context);
    });
  }
}