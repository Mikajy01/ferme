import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FinancialType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateFinancialTransactionDto {
  @ApiProperty({
    description: 'Type de la transaction financière (INCOME ou EXPENSE)',
    enum: FinancialType,
    example: FinancialType.INCOME,
  })
  @IsEnum(FinancialType)
  type: FinancialType;

  @ApiProperty({
    description: 'Montant de la transaction',
    example: 100.50,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Date de la transaction (format ISO 8601)',
    example: '2023-10-25T14:30:00.000Z',
  })
  @IsDateString()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Note optionnelle pour la transaction',
    example: 'Paiement client',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'ID de l\'achat associé (optionnel)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  purchaseId?: number;

  @ApiProperty({
    description: 'ID de la vente associée (optionnelle)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  saleId?: number;

  @ApiProperty({
    description: 'ID de la production associée (optionnelle)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productionId?: number;
}