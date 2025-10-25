import { Injectable } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class PrismaInventoryRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAllMovements(productId?: number) {
    return this.prisma.inventoryMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { include: { unit: true } },
        batch: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findAllBatches(productId?: number) {
    return this.prisma.batch.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { include: { unit: true } },
        purchaseItem: {
          include: {
            purchase: true,
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findBatchById(id: number) {
    return this.prisma.batch.findUnique({
      where: { id },
      include: {
        product: { include: { unit: true } },
        inventoryMovements: true,
      },
    });
  }

  async getStockByProduct() {
    const batches = await this.prisma.batch.findMany({
      include: {
        product: { include: { unit: true } },
      },
    });

    const stockMap = new Map<number, any>();

    for (const batch of batches) {
      if (!stockMap.has(batch.productId)) {
        stockMap.set(batch.productId, {
          productId: batch.productId,
          productName: batch.product.name,
          unit: batch.product.unit.code,
          totalQuantity: 0,
        });
      }
      const stock = stockMap.get(batch.productId);
      stock.totalQuantity += Number(batch.remaining);
    }

    return Array.from(stockMap.values());
  }

  async createMovement(data: any) {
    return this.prisma.inventoryMovement.create({
      data,
      include: {
        product: true,
        batch: true,
      },
    });
  }

  async updateBatchRemaining(batchId: number, newRemaining: number) {
    return this.prisma.batch.update({
      where: { id: batchId },
      data: { remaining: newRemaining },
    });
  }

  async deleteByReference(reference: string) {
    return this.prisma.inventoryMovement.deleteMany({
      where: { reference },
    });
  }
}
