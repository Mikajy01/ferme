import { Module } from '@nestjs/common';
import { FinancialService } from './services/financial.service';
import { FinancialController } from './controllers/financial.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaFinancialTransactionRepository } from './repositories/prisma-financial.repository';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [
    FinancialService,
    {
      provide: 'IFinancialRepository',
      useFactory: (prismaService: PrismaService) => new PrismaFinancialTransactionRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  controllers: [FinancialController],
})
export class FinancialModule {}
