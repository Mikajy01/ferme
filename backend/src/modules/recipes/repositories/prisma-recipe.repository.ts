import { Injectable } from '@nestjs/common';
import { Recipe, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateRecipeDto } from '../dto/create-recipe.dto';

@Injectable()
export class PrismaRecipeRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            product: { include: { unit: true } },
            unit: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            product: { include: { unit: true } },
            unit: true,
          },
        },
      },
    });
  }

  async create(data: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: {
        name: data.name,
        description: data.description,
        outputProductId: data.outputProductId,
        outputQuantity: data.outputQuantity,
        ingredients: {
          create: data.ingredients.map((ingredient) => ({
            productId: ingredient.productId,
            quantity: ingredient.quantity,
            unitId: ingredient.unitId,
          })),

        },
      },
    });
  }

  async update(id: number, data: Prisma.RecipeUpdateInput) {
    return this.prisma.recipe.update({
      where: { id },
      data,
      include: {
        ingredients: {
          include: {
            product: { include: { unit: true } },
            unit: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.recipe.delete({ where: { id } });
  }
}