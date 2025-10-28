export class ProductionBatchEntity {
    id: number;
    recipeId: number;
    outputProductId: number;
    outputQuantity: number;
    date: Date;
    createdAt?: Date;
    costTotal?: number;
}