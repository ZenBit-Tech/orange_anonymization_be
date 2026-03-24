import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
  @ApiProperty({
    description: 'Email address to send the magic link to',
    example: 'user@hospital.org',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
