import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerateSyntheticDto {
  @ApiProperty({ example: 10, minimum: 1, maximum: 1000 })
  @IsInt()
  @Min(1)
  @Max(1000)
  recordCount: number;

  @ApiProperty({
    example: ['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  entityTypes: string[];

  @ApiPropertyOptional({ example: 'en_US', default: 'en_US' })
  @IsOptional()
  @IsString()
  @IsIn(['en_US', 'en_GB', 'es_ES', 'de_DE', 'fr_FR'])
  locale?: string;
}
