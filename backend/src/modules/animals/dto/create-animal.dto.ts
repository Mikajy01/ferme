import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsNumber()
  @IsOptional()
  buyPrice?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
