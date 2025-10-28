import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { BatchesModule } from '../batches/batches.module';
import { FinancialModule } from '../financial/financial.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UnitsModule } from '../units/units.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { AnimalsModule } from '../animals/animals.module';
import { CulturesModule } from '../cultures/cultures.module';
import { RecipesModule } from '../recipes/recipes.module';
import { ProductionModule } from '../production/production.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    UnitsModule,
    ProductsModule,
    BatchesModule,
    FinancialModule,
    PurchasesModule,
    InventoryModule,
    AnimalsModule,
    CulturesModule,
    RecipesModule,
    ProductionModule,
    SalesModule
  ],
})
export class AppModule {}
