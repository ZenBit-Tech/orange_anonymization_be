import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyzerResultItemDto {
  @IsString()
  entity_type: string;

  @IsNumber()
  start: number;

  @IsNumber()
  end: number;

  @IsNumber()
  score: number;

  @IsOptional()  
  analysis_explanation: unknown;
}

export class AnonymizeTextDto {
  @ApiProperty({ example: 'Patient John Carter SSN: 523-45-6789' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({
    description: 'Output from the /analyze endpoint',
    type: [AnalyzerResultItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalyzerResultItemDto)
  analyzerResults: AnalyzerResultItemDto[];

  @ApiPropertyOptional({
    description: 'Anonymization strategy',
    enum: ['replace', 'redact', 'hash', 'encrypt', 'synthetic'],
    default: 'replace',
  })
  @IsOptional()
  @IsString()
  @IsIn(['replace', 'redact', 'hash', 'encrypt', 'synthetic'])
  strategy?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
