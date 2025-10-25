import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { PrismaInventoryRepository } from './repositories/prisma-inventory.repository';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaModule } from 'src/providers/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: 'IInventoryRepository',
      useFactory: (prismaService: PrismaService) => new PrismaInventoryRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
