import { ProductEntity } from "src/modules/products/entities/product.entity";

export class RecipeIngredientEntity {
    id: number;
    recipeId: number;
    productId: string;
    product?: ProductEntity;
    quantity: number;
    unitId: number;
}