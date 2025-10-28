import { PurchaseItemEntity } from "./purchase-item.entity";

export class PurchaseEntity {
    id: number;
    supplier: string;
    date: Date;
    items: PurchaseItemEntity[];
    totalAmount: number;
    createdAd?: Date;
}