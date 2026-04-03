import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class AnalyzeTextDto {
  @ApiProperty({
    description: 'Clinical text to analyze for PII entities',
    example: 'Patient John Carter (DOB: 03/15/1982) SSN: 523-45-6789',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  text: string;

  @ApiPropertyOptional({
    description: 'Language code (ISO 639-1)',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'de', 'fr'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Specific entity types to detect. If empty, detects all supported types.',
    example: ['PERSON', 'US_SSN', 'EMAIL_ADDRESS'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entities?: string[];
}
