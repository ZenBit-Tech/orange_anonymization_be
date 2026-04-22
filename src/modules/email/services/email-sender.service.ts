import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderMagicLinkTemplate } from '@/modules/email/templates/magic-link.template';
import * as nodemailer from 'nodemailer';

interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
}

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] ?? c,
  );
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com',
      port: 587,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Notification System" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }

  private getMagicLinkExpiryMinutes(): number {
    const expiresIn = Number(this.configService.get('MAGIC_LINK_EXPIRES_IN') ?? 900);
    return Math.floor(expiresIn / 60);
  }

  async requestMagicLink(email: string, token: string): Promise<{ message: string }> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
      const verifyUrl = new URL(`/auth/verify/token/${token}`, frontendUrl).toString();
      const expiresInMinutes = this.getMagicLinkExpiryMinutes();
      const html = renderMagicLinkTemplate({
        verifyUrl,
        expiresInMinutes,
      });
      await this.sendEmail(email, 'Sign in to De-ID Studio', html);
      return { message: 'Magic link sent' };
    } catch (error) {
      this.logger.error(
        `Failed to send magic link email to ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendContactForm(data: ContactFormPayload): Promise<{ success: boolean; message: string }> {
    try {
      const { firstName, lastName, email, message, company } = data;

      const htmlContent = `
      <div>
        <h3>New Contact Form Submission</h3>
        <p><b>First name:</b> ${escapeHtml(firstName)}</p>
        <p><b>Last name:</b> ${escapeHtml(lastName)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Company:</b> ${company ? escapeHtml(company) : 'N/A'}</p>
        <p><b>Message:</b></p>
        <p>${escapeHtml(message)}</p>
      </div>
    `;

      await this.sendEmail(
        this.configService.get<string>('MAIL_USER') ?? '',
        'New application from the site',
        htmlContent,
      );

      return {
        success: true,
        message: 'Form data sent successfully',
      };
    } catch (error) {
      this.logger.error(
        'Failed to send contact form',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
