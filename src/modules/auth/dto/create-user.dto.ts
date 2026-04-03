import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import type { UserRole } from '../../auth/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@hospital.org' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Carter' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: ['admin', 'analyst', 'viewer'], default: 'analyst' })
  @IsOptional()
  @IsEnum(['admin', 'analyst', 'viewer'])
  role?: UserRole;
}
