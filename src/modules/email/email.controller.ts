import { Controller, Post, Body } from '@nestjs/common';
import { ContactFormDto } from './dto/contact-form.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailSenderService } from './services/email-sender.service';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailSenderService) {}

  @Post('contact')
  @ApiOperation({ summary: 'Send contact form' })
  @ApiResponse({ status: 201, description: 'Email sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async sendContactForm(@Body() contactFormDto: ContactFormDto): Promise<{ message: string }> {
    await this.emailService.sendContactForm(contactFormDto);

    return { message: 'Your message is received' };
  }
}
