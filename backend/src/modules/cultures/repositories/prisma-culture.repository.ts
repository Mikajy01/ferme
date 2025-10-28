import { Injectable } from '@nestjs/common';
import { Culture } from '@prisma/client';
import { CreateCultureDto } from '../dto/create-culture.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { ICultureRepository } from '../interfaces/culture-repository.interface';

@Injectable()
export class PrismaCultureRepository implements ICultureRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(status?: string) {
    const cultures = await this.prisma.culture.findMany({
      where: status ? { status } : undefined,
      include: {
        events: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        harvests: {
          include: {
            product: true,
          },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Pour chaque culture, calculer la somme des coûts depuis cultureEvent
    const culturesWithCost = await Promise.all(
      cultures.map(async (culture) => {
        const totalCost = await this.prisma.cultureEvent.aggregate({
          where: { cultureId: culture.id },
          _sum: { cost: true },
        });

        // Calculer le total des récoltes
        const totalHarvested = await this.prisma.harvest.aggregate({
          where: { cultureId: culture.id },
          _sum: { quantity: true },
        });

        return {
          ...culture,
          totalExpenses: totalCost._sum.cost || 0,
          totalHarvested: totalHarvested._sum.quantity || 0,
        };
      }),
    );

    return culturesWithCost;
  }

  async findById(id: number) {
    const culture = await this.prisma.culture.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { date: 'desc' },
        },
        harvests: {
          include: {
            product: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!culture) return null;

    // Calculer le total des coûts
    const totalCost = await this.prisma.cultureEvent.aggregate({
      where: { cultureId: culture.id },
      _sum: { cost: true },
    });

    // Calculer le total des récoltes
    const totalHarvested = await this.prisma.harvest.aggregate({
      where: { cultureId: culture.id },
      _sum: { quantity: true },
    });

    return {
      ...culture,
      totalExpenses: totalCost._sum.cost || 0,
      totalHarvested: totalHarvested._sum.quantity || 0,
    };
  }

  async create(data: CreateCultureDto) {
    return this.prisma.culture.create({
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status || 'ongoing',
        area: data.area,
        note: data.note,
      },
    });
  }

  async update(id: number, data: Partial<CreateCultureDto>) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.note !== undefined) updateData.note = data.note;

    return this.prisma.culture.update({ where: { id }, data: updateData });
  }

  async delete(id: number) {
    return this.prisma.culture.delete({ where: { id } });
  }
}