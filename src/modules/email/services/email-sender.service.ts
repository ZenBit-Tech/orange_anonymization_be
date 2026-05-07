import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderMagicLinkTemplate } from '@/modules/email/templates/magic-link.template';
import { renderContactReceiptTemplate } from '@/modules/email/templates/contact-receipt.template';
import { renderContactAdminNotificationTemplate } from '@/modules/email/templates/contact-admin-notification.template';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  ContactFormPayload,
  MagicLinkResponse,
  RequestMagicLinkParams,
  SendContactFormResponse,
} from './types/email.types';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;
  private readonly contactRecipientEmail: string;
  private readonly frontendUrl: string;
  private readonly magicLinkExpiresInSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.getOrThrow<string>('SMTP_HOST');
    const smtpPort = this.configService.getOrThrow<number>('MAIL_PORT');
    const smtpUser = this.configService.getOrThrow<string>('MAIL_USER');
    const smtpPass = this.configService.getOrThrow<string>('MAIL_PASS');
    const mailFrom = this.configService.getOrThrow<string>('MAIL_FROM');
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const magicLinkExpiresIn = Number(
      this.configService.getOrThrow<string>('MAGIC_LINK_EXPIRES_IN'),
    );

    if (Number.isNaN(magicLinkExpiresIn)) {
      throw new Error('MAGIC_LINK_EXPIRES_IN must be a valid number');
    }

    this.fromAddress = mailFrom;
    this.contactRecipientEmail = mailFrom;
    this.frontendUrl = frontendUrl;
    this.magicLinkExpiresInSeconds = magicLinkExpiresIn;

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

  private async sendEmail(options: SendEmailOptions): Promise<void> {
    const { to, subject, html } = options;

    const info = await this.transporter.sendMail({
      from: `"De-ID Studio" <${this.fromAddress}>`,
      to,
      subject,
      html,
    });

    if (info.rejected.length > 0) {
      this.logger.error(
        `Email rejected: to=${to}, subject=${subject}, rejected=${info.rejected.join(', ')}`,
      );
      throw new Error(`Email delivery rejected for ${to}`);
    }

    this.logger.log(`Email sent: to=${to}, subject=${subject}, messageId=${info.messageId}`);
  }

  private getMagicLinkExpiryMinutes(): number {
    return Math.floor(this.magicLinkExpiresInSeconds / 60);
  }

  async requestMagicLink(params: RequestMagicLinkParams): Promise<MagicLinkResponse> {
    const { email, token } = params;

    try {
      const verifyUrl = new URL(`/auth/verify/token/${token}`, this.frontendUrl).toString();

      const expiresInMinutes = this.getMagicLinkExpiryMinutes();

      const html = renderMagicLinkTemplate({
        verifyUrl,
        expiresInMinutes,
      });

      await this.sendEmail({
        to: email,
        subject: 'Sign in to De-ID Studio',
        html,
      });

      return { message: 'Magic link sent' };
    } catch (error) {
      this.logger.error(
        `Failed to send magic link email to ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendContactForm(data: ContactFormPayload): Promise<SendContactFormResponse> {
    try {
      const { firstName, lastName, email, message, company } = data;

      const adminHtml = renderContactAdminNotificationTemplate({
        firstName,
        lastName,
        email,
        message,
        company,
      });

      await this.sendEmail({
        to: this.contactRecipientEmail,
        subject: 'New Contact Form Submission - De-ID Studio',
        html: adminHtml,
      });

      const receiptHtml = renderContactReceiptTemplate({
        firstName,
        message,
      });

      await this.sendEmail({
        to: email,
        subject: 'We received your message - De-ID Studio',
        html: receiptHtml,
      });

      return {
        success: true,
        message: 'Form data sent successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send contact form emails for ${data.email}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Propagate the error so callers (controller/tests) receive a 500
      throw error;
    }
  }
}
