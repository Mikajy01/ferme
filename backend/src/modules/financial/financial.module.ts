import { Module } from '@nestjs/common';
import { FinancialService } from './services/financial.service';
import { FinancialController } from './controllers/financial.controller';

@Module({
  providers: [FinancialService],
  controllers: [FinancialController]
})
export class FinancialModule {}
