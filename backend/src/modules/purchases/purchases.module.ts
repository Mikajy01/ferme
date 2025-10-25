import { Module } from '@nestjs/common';
import { PurchasesService } from './services/purchases.service';
import { PurchasesController } from './controllers/purchases.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';
import { PrismaPurchaseRepository } from './repositories/prisma-purchase.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    PurchasesService,
    {
      provide: 'IPurchaseRepository',
      useClass: PrismaPurchaseRepository,
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
