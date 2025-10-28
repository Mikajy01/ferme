import { applyDecorators } from '@nestjs/common';
import { 
  IsString, 
  IsEmail,
  IsNotEmpty, 
  Length, 
  Matches,
  IsEnum,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Role } from '../enums/roles.enum';

export function IsRoleValid() {
  return applyDecorators(
    ApiProperty({
      title: 'Rôle',
      description: 'Rôle de l’utilisateur',
      enum: Role,
      example: Role.USER,
    }),
    IsEnum(Role, { message: `Le rôle doit être l'une des valeurs suivantes: ${Object.values(Role).join(', ')}` })
  );
}

export function IsRoleArrayValid() {
  return applyDecorators(
    ApiPropertyOptional({ 
      type: [String], 
      enum: Role,
      description: 'Un ou plusieurs rôles',
      example: [Role.USER, Role.ADMIN]
    }),
    Transform(({ value }) => (Array.isArray(value) ? value : [value])),
    IsString({ each: true }),
    IsEnum(Role, { each: true, message: `Chaque rôle doit être l'une des valeurs suivantes: ${Object.values(Role).join(', ')}` })
  );
}

export function IsNomCompletValid() {
  return applyDecorators(
    ApiProperty({ 
      title: 'Nom complet',
      description: 'Nom complet du client',
      example: 'Jean Dupont',
      minLength: 2,
      maxLength: 100
    }),
    IsString({ message: 'Le nom complet doit être une chaîne de caractères' }),
    IsNotEmpty({ message: 'Le nom complet est obligatoire' }),
    Length(2, 100, { message: 'Le nom complet doit contenir entre 2 et 100 caractères' }),
    Transform(({ value }) => value?.trim()),
    Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
      message: 'Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets' 
    })
  );
}

// Décorateur pour l'email
export function IsEmailValid() {
  return applyDecorators(
    ApiProperty({ 
      title: 'Email',
      description: 'Email du client',
      example: 'jean.dupont@email.com',
      format: 'email'
    }),
    IsEmail({}, { message: 'L\'email doit avoir un format valide' }),
    IsNotEmpty({ message: 'L\'email est obligatoire' }),
    Transform(({ value }) => value?.toLowerCase().trim())
  );
}
