import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsDate, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class BatchFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrer par ID de produit',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({
    description: 'Date de réception minimale',
    example: '2025-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  receivedFrom?: Date;

  @ApiPropertyOptional({
    description: 'Date de réception maximale',
    example: '2025-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  receivedTo?: Date;

  @ApiPropertyOptional({
    description: 'Afficher uniquement les lots avec stock disponible',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasStock?: boolean;

  @ApiPropertyOptional({
    description: 'Afficher uniquement les lots expirés',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  expired?: boolean;
}