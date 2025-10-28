import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ example: true, description: 'Nouveau statut isActive' })
  @IsBoolean()
  isActive: boolean;
}
