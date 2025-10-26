import { Injectable } from '@nestjs/common';
import { AnimalEvent, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { IAnimalEventRepository } from '../interfaces/animal-event-repository.interface';
import { CreateAnimalEventDto } from '../dto/create-animal-event.dto';

@Injectable()
export class PrismaAnimalEventRepository implements IAnimalEventRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(animalId?: number) {
    return this.prisma.animalEvent.findMany({
      where: animalId ? { animalId } : undefined,
      include: { animal: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: CreateAnimalEventDto) {
    return this.prisma.animalEvent.create({
      data,
      include: { animal: true },
    });
  }
}