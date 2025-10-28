import { Module } from '@nestjs/common';
import { UnitsModule } from '../units/units.module';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaProductsRepository } from './repositories/prisma-product.repository';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Module({
  imports: [PrismaModule, UnitsModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: 'IProductRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaProductsRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [ProductsService, 'IProductRepository'],
})
export class ProductsModule {}
