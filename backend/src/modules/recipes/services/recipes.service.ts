import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { IRecipeRepository } from '../interfaces/recipe-repository.interface';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';

@Injectable()
export class RecipesService {
  constructor(
    @Inject('IRecipeRepository')
    private recipeRepository: IRecipeRepository,
  ) {}

  async findAll() {
    return this.recipeRepository.findAll();
  }

  async findOne(id: number) {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new NotFoundException(`Recette avec l'ID ${id} non trouvée`);
    }
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto) {
    return this.recipeRepository.create(createRecipeDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.recipeRepository.delete(id);
  }
}
