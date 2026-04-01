import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContactFormDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'john.doe@hospital.org' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'I need help integrating anonymization API.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ example: 'API Integration Question' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  subject?: string;

  @ApiPropertyOptional({ example: '+380123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}
