import { Injectable } from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { IAnimalRepository } from '../interfaces/animal-repository.interface';
import { CreateAnimalDto } from '../dto/create-animal.dto';

@Injectable()
export class PrismaAnimalRepository implements IAnimalRepository {
  constructor(private prisma: PrismaService | any) {}

  async findAll(status?: string) {
    return this.prisma.animal.findMany({
      where: status ? { status } : undefined,
      include: {
        events: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findById(id: number) {
    return this.prisma.animal.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async create(data: CreateAnimalDto) {
    return this.prisma.animal.create({ data });
  }

  async update(id: number, data: Prisma.AnimalUpdateInput) {
    return this.prisma.animal.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.animal.delete({ where: { id } });
  }
}