import { Module } from '@nestjs/common';
import { ProductionController } from './controllers/production.controller';
import { ProductionService } from './services/production.service';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaProductionBatchRepository } from './repositories/prisma-production.repository';
import { PrismaInventoryRepository } from '../inventory/repositories/prisma-inventory.repository';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';
import { PrismaRecipeRepository } from '../recipes/repositories/prisma-recipe.repository';

@Module({
  imports: [PrismaModule, InventoryModule, ProductsModule],
  controllers: [ProductionController],
  providers: [
    ProductionService,
    {
      provide: 'IProductionBatchRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaProductionBatchRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IRecipeRepository',
      useClass: PrismaRecipeRepository,
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
})
export class ProductionModule {}
