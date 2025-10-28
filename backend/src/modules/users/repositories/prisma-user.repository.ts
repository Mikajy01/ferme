import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transforme un tableau de données Prisma en tableau d'entités
   */
  private mapToEntities(dataArray: any[]): UserEntity[] {
    return dataArray.map((data) => this.mapToEntity(data));
  }

  async findAllWithPagination(
    where: any,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          idUser: true,
          session: true,
          name: true,
          firstName: true,
          role: true,
          isActive: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      total,
      data: this.mapToEntities(data),
    };
  }

  async findAll(where: any) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          idUser: true,
          session: true,
          name: true,
          firstName: true,
          role: true,
          isActive: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      total,
      data: this.mapToEntities(data),
    };
  }

  async findBySession(session: string): Promise<UserEntity | null> {
    const data = await this.prisma.user.findUnique({
      where: { session },
    });
    if (!data) {
      return null;
    }
    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const data = await this.prisma.user.findUnique({
      where: { idUser: id },
      select: {
        idUser: true,
        session: true,
        name: true,
        firstName: true,
        role: true,
        isActive: true,
      },
    });

    return this.mapToEntity(data);
  }

  async createUser(data: CreateUserDto): Promise<UserEntity> {
    const createdUser = await this.prisma.user.create({
      data,
      select: {
        idUser: true,
        session: true,
        name: true,
        firstName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async updateUser(
    id: string,
    data: CreateUserDto,
  ): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { idUser: id },
      data,
      select: {
        idUser: true,
        session: true,
        name: true,
        firstName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  async updateStatusBySession(
    session: string,
    isActive: boolean,
  ): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { session },
      data: { isActive },
      select: {
        idUser: true,
        session: true,
        name: true,
        firstName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  count(where?: any): Promise<number> {
    return this.prisma.user.count({ where });
  }

  /**
   * Transforme les données Prisma en entité UserEntity
   */
  private mapToEntity(user: any): UserEntity {
    const entity = new UserEntity();
    entity.session = user.session;
    entity.idUser = user.idUser;
    entity.session = user.session;
    entity.name = user.name;
    entity.firstName = user.firstName;
    entity.role = user.role;
    entity.password = user.password;
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }
}
