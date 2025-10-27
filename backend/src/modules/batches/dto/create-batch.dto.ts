import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsDecimal,
  IsDate,
  IsOptional,
  IsPositive,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateBatchDto {
  @ApiProperty({
    description: 'ID du produit',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiPropertyOptional({
    description: 'ID de l\'item d\'achat associé (optionnel)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  purchaseItemId?: number;

  @ApiProperty({
    description: 'Quantité initiale du lot',
    example: 100.5,
  })
  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Prix unitaire',
    example: 25.75,
  })
  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Quantité restante dans le lot',
    example: 80.5,
  })
  @IsOptional()
  @IsNumber()
  remaining?: number;

  @ApiProperty({
    description: 'Date de réception',
    example: '2025-01-15T10:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  receivedAt: Date;

  @ApiPropertyOptional({
    description: 'Date d\'expiration (optionnel)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;
}