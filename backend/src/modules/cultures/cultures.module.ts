import { Module } from '@nestjs/common';
import { CulturesService } from './services/cultures.service';
import { CulturesController } from './controllers/cultures.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaCultureRepository } from './repositories/prisma-culture.repository';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';
import { PrismaCultureEventRepository } from './repositories/prisma-culture-event.repository';
import { PrismaHarvestRepository } from './repositories/prisma-harvest.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PrismaModule],
  providers: [
    CulturesService,
    {
      provide: 'ICultureRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaCultureRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'ICultureEventRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaCultureEventRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IHarvestRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaHarvestRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  controllers: [CulturesController],
})
export class CulturesModule {}
