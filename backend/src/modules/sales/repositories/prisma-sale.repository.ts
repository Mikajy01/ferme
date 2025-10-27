import { Injectable } from '@nestjs/common';
import { Sale, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class PrismaSaleRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
            productionBatch: true,
          },
        },
        financialTransaction: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
            productionBatch: {
              include: {
                recipe: true,
              },
            },
          },
        },
        financialTransaction: true,
      },
    });
  }

  async create(data: Prisma.SaleCreateInput) {
    return this.prisma.sale.create({
      data,
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.sale.delete({ where: { id } });
  }

  async getTotalSalesByPeriod(startDate?: Date, endDate?: Date) {
    return this.prisma.sale.aggregate({
      where: {
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      _sum: { totalAmount: true },
      _count: true,
    });
  }
}
