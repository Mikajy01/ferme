import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class PrismaProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data,
      include: {
        unit: true,
      },
    });
  }

  async findAll(filter?: ProductFilterDto) {
    const where: Prisma.ProductWhereInput = {};

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.isSellable !== undefined) {
      where.isSellable = filter.isSellable;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { sku: { contains: filter.search } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        unit: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    });
  }

  async findBySku(sku: string) {
    return this.prisma.product.findUnique({
      where: { sku },
      include: {
        unit: true,
      },
    });
  }

  async update(id: number, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        unit: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCurrentStock(productId: number): Promise<number> {
    const batches = await this.prisma.batch.findMany({
      where: { productId },
      select: { remaining: true },
    });

    return batches.reduce((sum, batch) => sum + Number(batch.remaining), 0);
  }
}