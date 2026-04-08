import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactFormDto } from './dto/contact-form.dto';
import { EmailSenderService } from './services/email-sender.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly emailSenderService: EmailSenderService) {}

  @Post('contact-form')
  @ApiOperation({ summary: 'Send contact form notification to MAIL_USER' })
  async sendContactForm(@Body() dto: ContactFormDto): Promise<{ success: boolean }> {
    try {
      await this.emailSenderService.sendContactForm(dto);
      return { success: true };
    } catch {
      throw new InternalServerErrorException('Failed to send contact form');
    }
  }
}
