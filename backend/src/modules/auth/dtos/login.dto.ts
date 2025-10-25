import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin-session' })
  @IsString()
  session: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  password: string;
}
