import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { UnitsController } from './controllers/units.controller';
import { UnitsService } from './services/units.service';
import { PrismaUnitRepository } from './repositories/prisma-unit.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UnitsController],
  providers: [UnitsService,
    {
      provide: 'IUnitRepository',
      useClass: PrismaUnitRepository,
    },
  ],
  exports: [UnitsService, 'IUnitRepository'],
})
export class UnitsModule {}