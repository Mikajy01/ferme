import { ProductEntity } from "src/modules/products/entities/product.entity";

export class BatchEntity {
    id: number;
    productId: number;
    purchaseItemId?: number;
    quantity: number;
    remaining: number;
    unitPrice: number;
    receivedAt?: Date;
    expiryDate?: Date;
    createdAt?: Date;
    product: ProductEntity
}