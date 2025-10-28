import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { IProductionBatchRepository } from '../interfaces/production-batch-repository.interface';
import { ProductionBatchEntity } from '../entities/production-batch.entity';
import { CreateProductionBatchDto } from '../dto/create-production-batch.dto';

@Injectable()
export class PrismaProductionBatchRepository implements IProductionBatchRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll() {
    return this.prisma.productionBatch.findMany({
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                product: true,
                unit: true,
              },
            },
          },
        },
        outputProduct: { include: { unit: true } },
        inventoryMovements: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.productionBatch.findUnique({
      where: { id },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                product: true,
                unit: true,
              },
            },
          },
        },
        outputProduct: { include: { unit: true } },
        inventoryMovements: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
    });
  }

    async create(data: CreateProductionBatchDto): Promise<ProductionBatchEntity> {
    return this.prisma.productionBatch.create({
      data: {
        recipeId: data.recipeId,
        outputProductId: data.outputProductId,
        outputQuantity: data.outputQuantity,
        date: data.date ? new Date(data.date) : new Date(),
        costTotal: data.costTotal || 0,
      }
    });
  }

  async updateCostTotal(id: number, costTotal: number): Promise<ProductionBatchEntity> {
    return this.prisma.productionBatch.update({
      where: { id },
      data: { costTotal }, 
    });
  }
}