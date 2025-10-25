import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { UnitEntity } from '../entities/uniti.entity';

export interface IUnitRepository {
  create(data: CreateUnitDto): Promise<UnitEntity>;
  findByCode(code: string): Promise<UnitEntity>;
  findAll(): Promise<UnitEntity[]>;
  findOne(id: number): Promise<UnitEntity | null>;
  update(id: number, data: UpdateUnitDto): Promise<UnitEntity>;
  remove(id: number): void;
}
