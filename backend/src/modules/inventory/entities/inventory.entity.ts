export class InventoryMovementEntity {
    id: number;
    type: string;
    productId: number;
    BatchId: number;
    productionBatchId?: number;
    quantity: number;
    date: Date;
    reference?: string;
    note?: string;
}