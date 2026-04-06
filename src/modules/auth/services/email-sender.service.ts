import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { EMAIL_CONSTANTS } from '../constants/email.constants';

export interface ContactFormDetails {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
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
        this.logger.log(`${EMAIL_CONSTANTS.MAIL_FALLBACK_LOG_PREFIX} MAIL_USER is missing. Email not sent to: ${to}`);
        return;
      }

      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    try {
      const appHost = this.configService.get<string>('app.host') ?? EMAIL_CONSTANTS.LOCALHOST;
      const appPort = this.configService.get<number>('app.port') ?? EMAIL_CONSTANTS.DEFAULT_PORT;
      const protocol = appHost === EMAIL_CONSTANTS.LOCALHOST ? EMAIL_CONSTANTS.HTTP_PROTOCOL : EMAIL_CONSTANTS.HTTPS_PROTOCOL;
      const verifyUrl = `${protocol}://${appHost}:${appPort}/token/${token}`;
      const html = `
      <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#061a44;padding:22px 28px;color:#ffffff;">
              <div style="font-size:32px;line-height:1;">${EMAIL_CONSTANTS.BRAND_NAME}</div>
              <div style="margin-top:4px;font-size:16px;opacity:0.9;">${EMAIL_CONSTANTS.BRAND_SUBTITLE}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 28px;text-align:center;">
              <h1 style="margin:0 0 16px;font-size:38px;line-height:1.2;color:#111827;">Sign in to ${EMAIL_CONSTANTS.BRAND_NAME}</h1>
              <p style="margin:0 0 8px;font-size:18px;color:#6b7280;">Hi there,</p>
              <p style="margin:0 0 24px;font-size:18px;line-height:1.6;color:#6b7280;">
                Click the button below to sign in to your account.<br />
                This link is valid for ${EMAIL_CONSTANTS.MAGIC_LINK_VALIDITY}.
              </p>

              <a
                href="${verifyUrl}"
                style="display:inline-block;background:#25437a;color:#ffffff;text-decoration:none;font-size:20px;font-weight:600;padding:16px 28px;border-radius:10px;"
              >
                Sign In to ${EMAIL_CONSTANTS.BRAND_NAME}
              </a>

              <div style="margin:28px 0 18px;font-size:26px;color:#9ca3af;">or</div>

              <p style="margin:0 0 10px;font-size:18px;color:#6b7280;">Or copy this link into your browser:</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${verifyUrl}" style="color:#2563eb;font-size:18px;text-decoration:none;">${verifyUrl}</a>
              </p>

              <p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:#9ca3af;">
                If you did not request this email, you can safely ignore it.<br />
                Your account will remain secure.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;

      await this.sendRawEmail(email, EMAIL_CONSTANTS.MAGIC_LINK_SUBJECT, html);
    } catch (error) {
      this.logger.error(`Failed to send magic link email to ${email}`, error);
      throw error;
    }
  }

  async sendContactForm(details: ContactFormDetails): Promise<void> {
    try {
      const receiver = this.configService.get<string>('mail.user') ?? '';
      const html = `
      <div>
        <h3>New Contact Form Submission</h3>
        <p><b>First name:</b> ${_.escape(details.firstName)}</p>
        <p><b>Last name:</b> ${_.escape(details.lastName)}</p>
        <p><b>Email:</b> ${_.escape(details.email)}</p>
        <p><b>Company:</b> ${details.company ? _.escape(details.company) : EMAIL_CONSTANTS.CONTACT_FORM_DEFAULT_COMPANY}</p>
        <p><b>Message:</b></p>
        <p>${_.escape(details.message)}</p>
      </div>
    `;

      await this.sendRawEmail(receiver, EMAIL_CONSTANTS.CONTACT_FORM_SUBJECT, html);
    } catch (error) {
      this.logger.error(`Failed to send contact form email for ${details.email}`, error);
      throw error;
    }
  }
}
