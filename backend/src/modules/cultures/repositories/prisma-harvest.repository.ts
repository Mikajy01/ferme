import { Injectable } from '@nestjs/common';
import { Harvest } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { IHarvestRepository } from '../interfaces/harvest-repository.interface';

@Injectable()
export class PrismaHarvestRepository implements IHarvestRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(cultureId?: number) {
    return this.prisma.harvest.findMany({
      where: cultureId ? { cultureId } : undefined,
      include: {
        culture: true,
        product: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.harvest.findUnique({
      where: { id },
      include: {
        culture: true,
        product: true,
      },
    });
  }

  async create(data: {
    cultureId: number;
    productId: number;
    quantity: number;
    date: Date;
    note?: string;
  }) {
    return this.prisma.harvest.create({
      data: {
        cultureId: data.cultureId,
        productId: data.productId,
        quantity: data.quantity,
        date: data.date,
        note: data.note,
      },
      include: {
        culture: true,
        product: true,
      },
    });
  }
}