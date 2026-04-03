import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ContactFormDto } from './dto/contact-form.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailSenderService } from './services/email-sender.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailSenderService: EmailSenderService,
    private readonly configService: ConfigService,
  ) {}

  @Post('test-email')
  @ApiOperation({ summary: 'Temporary endpoint for SMTP + HTML magic-link testing' })
  @ApiBody({ type: SendEmailDto })
  async testEmail(@Body() dto: SendEmailDto): Promise<{ ok: true; receiver: string }> {
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
