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
    InventoryModule,
  ],
})
export class AppModule {}
