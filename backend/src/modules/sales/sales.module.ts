import { Module } from '@nestjs/common';
import { SalesService } from './services/sales.service';
import { SalesController } from './controllers/sales.controller';
import { PrismaSaleRepository } from './repositories/prisma-sale.repository';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';

@Module({
  imports: [PrismaModule],
  providers: [
    SalesService,
    {
      provide: 'ISaleRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaSaleRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  controllers: [SalesController],
})
export class SalesModule {}
