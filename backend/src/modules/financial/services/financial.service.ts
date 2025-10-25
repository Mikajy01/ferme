import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FinancialType } from '@prisma/client';
import { CreateFinancialTransactionDto } from '../dto/create-financial.dto';
import { IFinancialRepository } from '../interfaces/financial-repository.interface';

@Injectable()
export class FinancialService {
  constructor(
    @Inject('IFinancialRepository')
    private financialRepository: IFinancialRepository,
  ) {}

  async findAll(startDate?: Date, endDate?: Date) {
    return this.financialRepository.findAll({ startDate, endDate });
  }

  async findOne(id: number) {
    const transaction = await this.financialRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction financière avec l'ID ${id} non trouvée`);
    }
    return transaction;
  }

  async create(dto: CreateFinancialTransactionDto) {
    return this.financialRepository.create(dto);
  }

  async getBalance(startDate?: Date, endDate?: Date) {
    const transactions = await this.financialRepository.findAll({ startDate, endDate });
    
    const income = transactions
      .filter(t => t.type === FinancialType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === FinancialType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactions: transactions.length,
    };
  }

  async getByType(type: FinancialType, startDate?: Date, endDate?: Date) {
    return this.financialRepository.findByType(type, { startDate, endDate });
  }

  async getMonthlySummary(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    const transactions = await this.financialRepository.findAll({ startDate, endDate });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    for (const transaction of transactions) {
      const monthIndex = transaction.date.getMonth();
      const amount = Number(transaction.amount);

      if (transaction.type === FinancialType.INCOME) {
        monthlyData[monthIndex].income += amount;
      } else if (transaction.type === FinancialType.EXPENSE) {
        monthlyData[monthIndex].expense += amount;
      }
    }

    return monthlyData;
  }
}