import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { RecipeEntity } from '../entities/recipe.entity';

export interface IRecipeRepository {
  create(data: CreateRecipeDto): Promise<RecipeEntity>;
  findAll(): Promise<RecipeEntity[]>;
    findById(id: number): Promise<RecipeEntity | null>;
  //   update(id: number, data: UpdateBatchDto): Promise<BatchEntity>;
    delete(id: number): void;
  //   getExpiringSoon(day: number): Promise<BatchEntity[]>;
  //   updateRemaining(batchId: number, remaining: number): void;
}
