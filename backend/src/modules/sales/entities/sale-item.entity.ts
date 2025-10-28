import { ProductionBatch } from "@prisma/client";
import { ProductionBatchEntity } from "src/modules/production/entities/production-batch.entity";

export class SaleItemEntity {
    id: number;
    saleId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    proudctionBatchId?: number;
    productionBatch: ProductionBatchEntity;
}