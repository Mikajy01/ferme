import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHarvestDto {
  @ApiProperty({ description: 'ID de la culture' })
  @IsInt()
  cultureId: number;

  @ApiProperty({ description: 'ID du produit récolté' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantité récoltée' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Date de la récolte' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Note sur la récolte' })
  @IsOptional()
  @IsString()
  note?: string;
}