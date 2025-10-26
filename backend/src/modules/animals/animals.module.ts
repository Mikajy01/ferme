import { Module } from '@nestjs/common';
import { AnimalsService } from './services/animals.service';
import { AnimalsController } from './controllers/animals.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaAnimalRepository } from './repositories/prisma-animal.repository';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { PrismaAnimalEventRepository } from './repositories/prisma-animal-event.repository';
import { PrismaUnitOfWork } from 'src/common/prisma/prisma-unit-of-work';

@Module({
  imports: [PrismaModule],
  providers: [
    AnimalsService,
    {
      provide: 'IAnimalRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaAnimalRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IAnimalEventRepository',
      useFactory: (prismaService: PrismaService) =>
        new PrismaAnimalEventRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  controllers: [AnimalsController],
})
export class AnimalsModule {}
