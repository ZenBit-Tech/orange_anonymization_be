import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register user by email' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        user: { id: 'uuid', email: 'user@gmail.com' },
        accessToken: 'jwt_token',
      },
    },
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Invalid email',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email);
  }
}
