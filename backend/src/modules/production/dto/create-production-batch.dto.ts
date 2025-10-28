import { IsInt, IsNumber, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductionBatchDto {
  @IsInt()
  @IsNotEmpty()
  recipeId: number;

  @IsInt()
  @IsNotEmpty()
  outputProductId: number;

  @IsNumber()
  @IsNotEmpty()
  outputQuantity: number;

  @IsNumber()
  @IsOptional()
  costTotal?: number;

  @IsDateString()
  @IsOptional()
  date?: string;
}
