import { IsEnum, IsNumber, IsInt, IsDateString, IsOptional, IsString, IsDate } from 'class-validator';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateInventoryMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  productId: number;

  @IsInt()
  @IsOptional()
  batchId?: number;

  @IsNumber()
  quantity: number;

  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  note?: string;
}