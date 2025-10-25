import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductEntity } from "../entities/product.entity";

export interface IProductRepository {
  create(data: CreateProductDto): Promise<ProductEntity>;
  findBySku(sku: string): Promise<ProductEntity>;
  findAll(filter?: any): Promise<ProductEntity[]>;
  findOne(id: number): Promise<ProductEntity | null>;
  update(id: number, data: UpdateProductDto): Promise<ProductEntity>;
  remove(id: number): void;
  getCurrentStock(id: number): Promise<number>;
}
