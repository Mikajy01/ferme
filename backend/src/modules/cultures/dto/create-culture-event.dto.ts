import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateCultureEventDto {
  @ApiProperty({ description: 'ID de la culture' })
  @IsInt()
  cultureId: number;

  @ApiProperty({
    description: 'Type d\'événement',
    examples: ['seeding', 'watering', 'fertilization', 'weeding', 'harvest', 'treatment'],
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Date de l\'événement' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Description de l\'événement' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Coût de l\'événement' })
  @IsOptional()
  @IsNumber()
  cost?: number;
}