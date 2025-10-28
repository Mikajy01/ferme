import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsDecimal,
} from 'class-validator';

export class CreateCultureDto {
  @ApiProperty({ description: 'Nom de la culture' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Date de début' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Statut de la culture', default: 'ongoing' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Surface cultivée (en hectares ou m²)' })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ description: 'Note supplémentaire' })
  @IsOptional()
  @IsString()
  note?: string;
}