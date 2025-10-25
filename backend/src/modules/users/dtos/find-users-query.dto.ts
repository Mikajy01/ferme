import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsRoleArrayValid } from 'src/common/decorators/validation.decorator';
import { Role } from 'src/common/enums/roles.enum';

export class FindUsersQueryDto {
  @IsOptional()
  @IsRoleArrayValid()
  role?: Role[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filtrer les utilisateurs actifs ou non',
    example: true,
  })
  isActive?: string;


  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  @ApiPropertyOptional({
    description: 'Terme de recherche (session, nom complet)',
  })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()                 
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
