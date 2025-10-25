import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { IPurchaseRepository } from '../interfaces/purchase-repository.interface';

@Injectable()
export class PrismaPurchaseRepository implements IPurchaseRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll() {
    return this.prisma.purchase.findMany({
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
            batch: true,
          },
        },
        financialTransaction: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
            batch: true,
          },
        },
        financialTransaction: true,
      },
    });
  }

  async create(data: CreatePurchaseDto, totalAmount: number) {
    return this.prisma.purchase.create({
      data: {
        supplier: data.supplier,
        date: data.date,
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
  }

  async delete(id: number) {
    return this.prisma.purchase.delete({ where: { id } });
  }
}
