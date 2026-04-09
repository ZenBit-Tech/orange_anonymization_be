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
  })
  @ApiBadRequestResponse({
    description: 'Invalid email',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email);
  }
}
