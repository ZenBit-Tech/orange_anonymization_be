import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class SendEmailDto {
  @ApiPropertyOptional({
    description: 'Optional receiver for email. MAIL_USER will be used by default.',
    example: 'developer@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}
