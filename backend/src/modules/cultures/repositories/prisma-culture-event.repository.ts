import { Injectable } from '@nestjs/common';
import { CultureEvent } from '@prisma/client';
import { CreateCultureEventDto } from '../dto/create-culture-event.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { ICultureEventRepository } from '../interfaces/culture-event-repository.interface';

@Injectable()
export class PrismaCultureEventRepository implements ICultureEventRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(cultureId?: number) {
    return this.prisma.cultureEvent.findMany({
      where: cultureId ? { cultureId } : undefined,
      include: { culture: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: CreateCultureEventDto) {
    return this.prisma.cultureEvent.create({
      data: {
        culture: { connect: { id: data.cultureId } },
        type: data.type,
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.description ? { description: data.description } : {}),
        cost: data.cost || 0,
      },
      include: { culture: true },
    });
  }
}