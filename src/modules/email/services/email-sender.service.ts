import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { renderMagicLinkTemplate } from '../templates/magic-link.template';

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

  private async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailUser = this.configService.get<string>('mail.user') ?? '';

      if (!mailUser) {
        this.logger.log(
          `[MAIL_FALLBACK] MAIL_USER is missing. Email not sent to: ${to}`,
        );
        return;
      }

      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? '';
      const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`;
      const html = renderMagicLinkTemplate({ verifyUrl });

      await this.sendRawEmail(email, 'Sign in to De-ID Studio', html);
    } catch (error) {
      this.logger.error(
        `Failed to send magic link email to ${email}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendContactForm(details: ContactFormPayload): Promise<void> {
    try {
      const receiver = this.configService.get<string>('mail.user') ?? '';
      const html = `
      <div>
        <h3>New Contact Form Submission</h3>
        <p><b>First name:</b> ${escapeHtml(details.firstName)}</p>
        <p><b>Last name:</b> ${escapeHtml(details.lastName)}</p>
        <p><b>Email:</b> ${escapeHtml(details.email)}</p>
        <p><b>Company:</b> ${details.company ? escapeHtml(details.company) : 'N/A'}</p>
        <p><b>Message:</b></p>
        <p>${escapeHtml(details.message)}</p>
      </div>
    `;

      await this.sendRawEmail(receiver, 'New Contact Form Notification', html);
    } catch (error) {
      this.logger.error(
        `Failed to send contact form email for ${details.email}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
