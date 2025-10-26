import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, Min, ArrayNotEmpty } from 'class-validator';

export class FeedAnimalDto {
  @ApiProperty({
    description: "Identifiants des animaux à nourrir",
    example: [1, 2, 3],
  })
  @IsArray({ message: 'Le champ animals doit être un tableau.' })
  @ArrayNotEmpty({ message: 'Le tableau animals ne peut pas être vide.' })
  @IsInt({ each: true, message: 'Chaque identifiant d’animal doit être un entier.' })
  animals: number[];

  @ApiProperty({
    description: "Identifiant du batch (lot d’aliment) utilisé",
    example: 5,
  })
  @IsInt({ message: 'Le batchId doit être un entier.' })
  batchId: number;

  @ApiProperty({
    description: "Quantité totale distribuée (kg, litres, etc.)",
    example: 25.5,
  })
  @IsNumber({}, { message: 'La quantité doit être un nombre.' })
  @Min(0.01, { message: 'La quantité doit être supérieure à 0.' })
  quantity: number;

  @ApiProperty({
    description: "Date du nourrissage (optionnelle, format ISO 8601)",
    example: "2025-10-26T10:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La date doit être au format ISO valide.' })
  date?: string;
}
