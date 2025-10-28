import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Semences de Maïs',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Code SKU unique (optionnel)',
    example: 'SEED-CORN-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({
    description: 'Catégorie du produit',
    enum: ProductCategory,
    example: ProductCategory.AGRICULTURE,
  })
  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({
    description: 'ID de l\'unité de mesure',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  unitId: number;

  @ApiProperty({
    description: 'Le produit est-il vendable ?',
    example: true,
    default: false,
  })
  @IsBoolean()
  isSellable: boolean;
}