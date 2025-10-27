import { RecipeIngredientEntity } from "./recipe-ingredient.entity";
import { ProductEntity } from "src/modules/products/entities/product.entity";

export class RecipeEntity {
    id: number;
    name: string;
    description: string;
    outputProductId: number;
    outputQuantity: number;
    createdAt?: Date;
    outputProduct?: ProductEntity;
    ingredients: RecipeIngredientEntity[];
}