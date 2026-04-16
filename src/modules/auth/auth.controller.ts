import { Body, Controller, Post, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginMessageDto } from './dto/login-message.dto';
import { VerifyResponseDto, VerifyTokenDto } from './dto/verify-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register user by email' })
  @ApiResponse({
    status: 200,
    description: 'Magic link sent to email',
    type: LoginMessageDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Invalid email',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() dto: LoginDto): Promise<LoginMessageDto> {
    return this.authService.login(dto.email);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify magic link token and return JWT session token' })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    type: VerifyResponseDto,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error',
  })
  verify(@Query() query: VerifyTokenDto): Promise<VerifyResponseDto> {
    return this.authService.verify(query.token);
  }
}
