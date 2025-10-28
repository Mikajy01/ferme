import { IsInt, IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateAnimalEventDto {
  @IsInt()
  animalId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsOptional()
  inventoryMovementId?: number;
}