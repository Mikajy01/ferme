export class ProductEntity {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitId: string;
  issellable: boolean;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}