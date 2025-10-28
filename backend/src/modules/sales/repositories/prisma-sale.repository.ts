import { Injectable } from '@nestjs/common';
import { Sale, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { ISaleRepository } from '../interfaces/sale-repository.interface';
import { SaleEntity } from '../entities/sale.entity';
import { SaleItemEntity } from '../entities/sale-item.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';

@Injectable()
export class PrismaSaleRepository implements ISaleRepository {
  constructor(private prisma: PrismaService | any) {}

  private mapToEntity(sale: any): SaleEntity {
    return {
      id: sale.id,
      customer: sale.customer ?? undefined,
      date: sale.date,
      totalAmount: Number(sale.totalAmount),
      items: sale.items?.map((item: any) => this.mapItemToEntity(item)) || [],
    };
  }

  private mapItemToEntity(item: any): SaleItemEntity {
    return {
      id: item.id,
      saleId: item.saleId,
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      proudctionBatchId: item.productionBatchId,
      productionBatch: item.productionBatch,
    };
  }

  async findAll(): Promise<SaleEntity[]> {
    const sales = await this.prisma.sale.findMany({
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

    return sales.map(sale => this.mapToEntity(sale));
  }

  async findById(id: number): Promise<SaleEntity | null> {
    const sale = await this.prisma.sale.findUnique({
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

    return sale ? this.mapToEntity(sale) : null;
  }

  async create(data: CreateSaleDto, totalAmount: number): Promise<SaleEntity> {
    const sale = await this.prisma.sale.create({
      data: {
        customer: data.customer,
        date: data.date? new Date(data.date) : new Date(),
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
          },
        },
      },
    });

    return this.mapToEntity(sale);
  }

  async delete(id: number) {
    return this.prisma.sale.delete({ where: { id } });
  }

  async getTotalSalesByPeriod(startDate?: Date, endDate?: Date): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      where: {
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    return Number(result._sum.totalAmount || 0);
  }
}