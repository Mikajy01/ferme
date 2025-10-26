import { HarvestEntity } from "../entities/harvest.entity";

export interface IHarvestRepository {
  create(data: {
    cultureId: number;
    productId: number;
    quantity: number;
    date: Date;
    note?: string;
  }): Promise<HarvestEntity>;
  findAll(cultureId?: number): Promise<HarvestEntity[]>;
  //   findOne(id: number): Promise<BatchEntity | null>;
  //   update(id: number, data: UpdateBatchDto): Promise<BatchEntity>;
  //   remove(id: number): void;
  //   getExpiringSoon(day: number): Promise<BatchEntity[]>;
  //   updateRemaining(batchId: number, remaining: number): void;
}
