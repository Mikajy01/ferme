import { IsBoolean, IsNotEmpty, IsOptional, isString, IsString, ValidateIf } from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';
import { 
  IsNomCompletValid,
  IsEmailValid,
  IsRoleValid,
} from '../../../common/decorators/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'session1', description: 'Session de l\'utilisateur' })
  session: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsRoleValid()
  role: Role;

  @IsBoolean()
  @ApiProperty({ example: true, description: 'Statut actif ou non' })
  isActive: boolean;
}
