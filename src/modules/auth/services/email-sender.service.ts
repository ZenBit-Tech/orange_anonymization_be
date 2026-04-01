import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface ContactFormDetails {
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    const mailUser = this.configService.get<string>('mail.user') ?? '';

    if (!mailUser) {
      this.logger.log(
        `[MAIL_FALLBACK] MAIL_USER is missing. to=${to} subject=${subject} html=${html}`,
      );
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const verifyUrl = `http://localhost:3000/token/${token}`;
    const html = `
      <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#061a44;padding:22px 28px;color:#ffffff;">
              <div style="font-size:32px;line-height:1;">De-ID Studio</div>
              <div style="margin-top:4px;font-size:16px;opacity:0.9;">De-ID and Synthesis</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 28px;text-align:center;">
              <h1 style="margin:0 0 16px;font-size:38px;line-height:1.2;color:#111827;">Sign in to De-ID Studio</h1>
              <p style="margin:0 0 8px;font-size:18px;color:#6b7280;">Hi there,</p>
              <p style="margin:0 0 24px;font-size:18px;line-height:1.6;color:#6b7280;">
                Click the button below to sign in to your account.<br />
                This link is valid for 15 minutes.
              </p>

              <a
                href="${verifyUrl}"
                style="display:inline-block;background:#25437a;color:#ffffff;text-decoration:none;font-size:20px;font-weight:600;padding:16px 28px;border-radius:10px;"
              >
                Sign In to De-ID Studio
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

    await this.sendRawEmail(email, 'Your Clinical Data Studio Magic Link', html);
  }

  async sendContactForm(details: ContactFormDetails): Promise<void> {
    const receiver = this.configService.get<string>('mail.user') ?? '';
    const subject = details.subject ?? 'New Contact Form Notification';

    const html = `
      <div>
        <h3>New Contact Form Submission</h3>
        <p><b>Name:</b> ${details.name}</p>
        <p><b>Email:</b> ${details.email}</p>
        <p><b>Phone:</b> ${details.phone ?? 'N/A'}</p>
        <p><b>Message:</b></p>
        <p>${details.message}</p>
      </div>
    `;

    await this.sendRawEmail(receiver, subject, html);
  }
}
