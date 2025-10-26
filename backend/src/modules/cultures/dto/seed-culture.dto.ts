import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class SeedCultureDto {
  @ApiProperty({ description: 'ID du batch de semences/intrants à utiliser' })
  @IsInt()
  batchId: number;

  @ApiProperty({ description: 'Quantité à utiliser' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'ID de la culture à semer/fertiliser' })
  @IsInt()
  cultureId: number;

  @ApiProperty({ description: 'Date du semis/application' })
  @IsDateString()
  date: string;
}