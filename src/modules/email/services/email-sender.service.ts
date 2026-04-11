import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { renderMagicLinkTemplate } from '../templates/magic-link.template';
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

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private async sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: 587,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    await transporter.sendMail({
      from: `"Система сповіщень" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const verifyUrl = `${frontendUrl}/auth/verify/token/${token}`;
      const html = renderMagicLinkTemplate({ verifyUrl });

      await this.sendEmail(email, 'Sign in to De-ID Studio', html);
    } catch (error) {
      this.logger.error(
        `Failed to send magic link email to ${email}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async requestMagicLink(email: string, token: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const verifyUrl = `${frontendUrl}/auth/verify/token/${token}`;
      const html = renderMagicLinkTemplate({ verifyUrl });

      await this.sendEmail(email, 'Sign in to De-ID Studio', html);

      return { message: 'Magic link sent' };
    } catch (error) {
      this.logger.error(
        `Failed to send magic link email to ${email}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendContactForm(data: ContactFormPayload) {
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

    return { success: true, message: 'Form data sent successfully' };
  }
}
