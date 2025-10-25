import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class PrismaUnitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUnitDto) {
    return this.prisma.unit.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.unit.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.unit.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.unit.findUnique({
      where: { code },
    });
  }

  async update(id: number, data: UpdateUnitDto) {
    return this.prisma.unit.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.unit.delete({
      where: { id },
    });
  }

  async count() {
    return this.prisma.unit.count();
  }
}