import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateBatchDto } from '../dto/create-batch.dto';
import { BatchFilterDto } from '../dto/batch-filter.dto';
import { UpdateBatchDto } from '../dto/update-batch.dto';
import { IBatchRepository } from '../interfaces/batches-repository.interface';

@Injectable()
export class PrismaBatchRepository implements IBatchRepository {
  constructor(private prisma: PrismaService | any) {}

  async create(data: CreateBatchDto) {
    return this.prisma.batch.create({
      data: {
        productId: data.productId,
        purchaseItemId: data.purchaseItemId,
        quantity: data.quantity,
        remaining: data.quantity, // initially remaining = quantity
        unitPrice: data.unitPrice,
        receivedAt: data.receivedAt,
        expiryDate: data.expiryDate,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
    });
  }

  async findAll(filter?: BatchFilterDto) {
    const where: Prisma.BatchWhereInput = {};

    if (filter?.productId) {
      where.productId = filter.productId;
    }

    if (filter?.receivedFrom || filter?.receivedTo) {
      where.receivedAt = {};
      if (filter.receivedFrom) {
        where.receivedAt.gte = filter.receivedFrom;
      }
      if (filter.receivedTo) {
        where.receivedAt.lte = filter.receivedTo;
      }
    }

    if (filter?.hasStock) {
      where.remaining = { gt: 0 };
    }

    if (filter?.expired) {
      where.expiryDate = { lt: new Date() };
    }

    return this.prisma.batch.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.batch.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
        inventoryMovements: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: number, data: UpdateBatchDto) {
    return this.prisma.batch.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
    });
  }

  async updateRemaining(id: number, remaining: number) {
    return this.prisma.batch.update({
      where: { id },
      data: { remaining },
    });
  }

  async remove(id: number) {
    return this.prisma.batch.delete({
      where: { id },
    });
  }

  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        remaining: { gt: 0 },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getBatchAvailable(productId: number) {
    return this.prisma.batch.findMany({
      where: {
        productId,
        remaining: { gt: 0 },
      },
      include: {  
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
          },
        },
      },
      orderBy: { receivedAt: 'asc' },
    });
  }
}