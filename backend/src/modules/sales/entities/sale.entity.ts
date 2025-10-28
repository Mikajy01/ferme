import { SaleItemEntity } from "./sale-item.entity";

export class SaleEntity {
    id: number;
    customer?: string ;
    date?: Date;
    totalAmount: number;
    items: SaleItemEntity[];
}