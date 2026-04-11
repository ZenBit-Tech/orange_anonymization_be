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
import { LoginResponseDto } from './dto/login-response.dto';
import { ContactFormDto } from './dto/contact-form.dto';
import { EmailSenderService } from '../email/services/email-sender.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register user by email' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Invalid email',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.email);
  }

  @Post('contact-form')
  @ApiOperation({ summary: 'Send contact form notification to MAIL_USER' })
  async sendContactForm(@Body() dto: ContactFormDto): Promise<{ success: boolean }> {
    await this.emailSenderService.sendContactForm(dto);
    return { success: true };
  }
}
