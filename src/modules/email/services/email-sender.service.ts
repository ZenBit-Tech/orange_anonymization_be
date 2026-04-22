import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderMagicLinkTemplate } from '@/modules/email/templates/magic-link.template';
import { renderContactReceiptTemplate } from '@/modules/email/templates/contact-receipt.template';
import { renderContactAdminNotificationTemplate } from '@/modules/email/templates/contact-admin-notification.template';
import * as nodemailer from 'nodemailer';

interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private readonly transporter;
  private readonly fromAddress: string;
  private readonly contactRecipientEmail: string;

  constructor(private readonly configService: ConfigService) {
    const smtpHost =
      this.configService.get<string>('mail.host') ||
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('MAIL_HOST') ||
      'smtp.gmail.com';
    const smtpPort =
      this.configService.get<number>('mail.port') ??
      this.configService.get<number>('MAIL_PORT') ??
      587;
    const smtpUser =
      this.configService.get<string>('mail.user') ||
      this.configService.get<string>('MAIL_USER') ||
      '';
    const smtpPass =
      this.configService.get<string>('mail.pass') ||
      this.configService.get<string>('MAIL_PASS') ||
      '';
    const configuredFrom =
      this.configService.get<string>('mail.from') ||
      this.configService.get<string>('MAIL_FROM') ||
      smtpUser;

    this.fromAddress = configuredFrom;
    this.contactRecipientEmail = configuredFrom || smtpUser;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"De-ID Studio" <${this.fromAddress}>`,
      to,
      subject,
      html,
    });

    if (info.rejected.length > 0) {
      this.logger.error(
        `Email rejected for recipient ${to}. Subject: ${subject}. Rejected: ${info.rejected.join(', ')}`,
      );
      throw new Error(`Email delivery rejected for ${to}`);
    }

    this.logger.log(`Email sent: subject="${subject}" to="${to}" messageId="${info.messageId}"`);
  }

  async requestMagicLink(email: string, token: string): Promise<{ message: string }> {
    try {
      const frontendUrl =
        this.configService.get<string>('app.frontendUrl') ??
        this.configService.get<string>('FRONTEND_URL') ??
        '';
      const verifyUrl = new URL(`/auth/verify/token/${token}`, frontendUrl).toString();
      const html = renderMagicLinkTemplate({ verifyUrl });
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
    const { firstName, lastName, email, message, company } = data;

    const adminNotificationHtml = renderContactAdminNotificationTemplate({
      firstName,
      lastName,
      email,
      message,
      company,
    });

    await this.sendEmail(
      this.contactRecipientEmail,
      'New Contact Form Submission - De-ID Studio',
      adminNotificationHtml,
    );

    const contactReceiptHtml = renderContactReceiptTemplate({ firstName, message });
    await this.sendEmail(email, 'We received your message - De-ID Studio', contactReceiptHtml);

    return {
      success: true,
      message: 'Form data sent successfully',
    };
  }
}
