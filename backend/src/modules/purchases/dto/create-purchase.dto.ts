import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";

export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}

export class CreatePurchaseItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}