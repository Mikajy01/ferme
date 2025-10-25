import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ProductCategory } from '@prisma/client';
import { Transform } from 'class-transformer';

export class ProductFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    enum: ProductCategory,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Filtrer par vendabilité',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSellable?: boolean;

  @ApiPropertyOptional({
    description: 'Rechercher dans le nom ou SKU',
    example: 'maïs',
  })
  @IsOptional()
  search?: string;
}