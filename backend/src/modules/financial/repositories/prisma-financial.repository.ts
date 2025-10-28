import { Injectable } from '@nestjs/common';

import { FinancialTransaction, FinancialType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateFinancialTransactionDto } from '../dto/create-financial.dto';
import { IFinancialRepository } from '../interfaces/financial-repository.interface';

@Injectable()
export class PrismaFinancialTransactionRepository implements IFinancialRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<FinancialTransaction[]> {
    const where: Prisma.FinancialTransactionWhereInput = {};

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lt = options.endDate; // Utiliser lt pour exclure le 1er janvier de l'année suivante
    }

    return this.prisma.financialTransaction.findMany({
      where,
      include: {
        purchase: true,
        sale: true,
        production: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: number): Promise<FinancialTransaction | null> {
    return this.prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        purchase: true,
        sale: true,
        production: true,
      },
    });
  }

  async create(
    data: CreateFinancialTransactionDto,
  ): Promise<FinancialTransaction> {
    return this.prisma.financialTransaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        ...(data.note ? { note: data.note } : {}),
        ...(data.purchaseId
          ? { purchase: { connect: { id: data.purchaseId } } }
          : {}),
        ...(data.saleId ? { sale: { connect: { id: data.saleId } } } : {}),
        ...(data.productionId
          ? { production: { connect: { id: data.productionId } } }
          : {}),
      },
    });
  }

  async update(
    id: number,
    data: Partial<CreateFinancialTransactionDto>,
  ): Promise<FinancialTransaction> {
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.note !== undefined) updateData.note = data.note;
    if (data.purchaseId !== undefined)
      updateData.purchase = { connect: { id: data.purchaseId } };
    if (data.saleId !== undefined)
      updateData.sale = { connect: { id: data.saleId } };
    if (data.productionId !== undefined)
      updateData.production = { connect: { id: data.productionId } };

    return this.prisma.financialTransaction.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<FinancialTransaction> {
    return this.prisma.financialTransaction.delete({ where: { id } });
  }

  async deleteBySaleId(saleId: number): Promise<void> {
    await this.prisma.financialTransaction.deleteMany({
      where: { saleId },
    });
  }

  async findByType(
    type: FinancialType,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<FinancialTransaction[]> {
    const where: Prisma.FinancialTransactionWhereInput = { type };

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lt = options.endDate; // Utiliser lt pour exclure la date de fin si nécessaire
    }

    return this.prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }
}
