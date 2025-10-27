import { Module } from '@nestjs/common';
import { RecipesService } from './services/recipes.service';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { PrismaRecipeRepository } from './repositories/prisma-recipe.repository';
import { RecipesController } from './controllers/recipes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    {
      provide: 'IRecipeRepository',
      useClass: PrismaRecipeRepository,
    },
  ],
  exports: [RecipesService, 'IRecipeRepository'],
})
export class RecipesModule {}
