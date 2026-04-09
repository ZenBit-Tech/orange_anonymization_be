import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@gmail.com',
  })
  @IsEmail()
  email: string;
}
