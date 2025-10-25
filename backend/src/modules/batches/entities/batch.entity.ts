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
}