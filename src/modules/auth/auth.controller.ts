import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { EmailSenderService } from './services/email-sender.service';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';
import { TestEmailDto } from './dto/test-email.dto';
import { ContactFormDto } from './dto/contact-form.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailSenderService: EmailSenderService,
    private readonly configService: ConfigService,
  ) {}

  @Post('magic-link/request')
  @ApiOperation({ summary: 'Request a magic link' })
  requestMagicLink(@Body() dto: RequestMagicLinkDto): Promise<void> {
    return this.authService.requestMagicLink(dto.email);
  }

  @Post('magic-link/verify')
  @ApiOperation({ summary: 'Verify a magic link token and return JWT' })
  verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto.token);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Temporary endpoint for SMTP + HTML magic-link testing' })
  @ApiBody({ type: TestEmailDto })
  async testEmail(@Body() dto: TestEmailDto): Promise<{ ok: true; receiver: string }> {
    const receiver = dto.email ?? this.configService.get<string>('mail.user') ?? '';
    await this.emailSenderService.sendMagicLink(receiver, 'test-token-from-temp-endpoint');
    return { ok: true, receiver };
  }

  @Post('contact-form')
  @ApiOperation({ summary: 'Send contact form notification to MAIL_USER' })
  sendContactForm(@Body() dto: ContactFormDto): Promise<void> {
    return this.emailSenderService.sendContactForm(dto);
  }
}
