import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { BatchesController } from './controllers/batches.controller';
import { BatchesService } from './services/batches.service';
import { PrismaBatchRepository } from './repositories/prisma-batch.repository';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [BatchesController],
  providers: [
    BatchesService,
    {
      provide: 'IBatchRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaBatchRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [BatchesService],
})
export class BatchesModule {}
