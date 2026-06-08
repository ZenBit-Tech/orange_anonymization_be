import { ApiProperty } from '@nestjs/swagger';

export class LoginMessageDto {
  @ApiProperty({
    example: 'Magic link sent to your email',
  })
  message: string;
}
