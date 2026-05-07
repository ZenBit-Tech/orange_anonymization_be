import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailSenderService } from './email-sender.service';

jest.mock('nodemailer');

describe('EmailSenderService', () => {
  let configMock: ConfigService;

  beforeEach(() => {
    configMock = {
      getOrThrow: jest.fn((key: string) => {
        const map: Record<string, string | number> = {
          SMTP_HOST: 'smtp.example.com',
          MAIL_PORT: 587,
          MAIL_USER: 'user',
          MAIL_PASS: 'pass',
          MAIL_FROM: 'no-reply@example.com',
          FRONTEND_URL: 'http://localhost:3000',
          MAGIC_LINK_EXPIRES_IN: '3600',
        };

        return map[key];
      }),
    } as unknown as ConfigService;
  });

  afterEach(() => jest.clearAllMocks());

  it('sends two emails on successful contact submission', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ rejected: [], messageId: 'id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const svc = new EmailSenderService(configMock);

    const payload = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      message: 'This message is long enough to pass validation.',
      company: 'Org',
    };

    const res = await svc.sendContactForm(payload);

    expect(sendMailMock).toHaveBeenCalledTimes(2);
    expect(res.success).toBe(true);
  });

  it('throws when transporter reports rejected recipients', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ rejected: ['no-reply@example.com'] });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const svc = new EmailSenderService(configMock);

    const payload = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      message: 'This message is long enough to pass validation.',
      company: 'Org',
    };

    await expect(svc.sendContactForm(payload)).rejects.toThrow();
  });
});
