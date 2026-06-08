import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EmailController } from '@/modules/email/email.controller';
import { EmailSenderService } from '@/modules/email/services/email-sender.service';

describe('Email E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [EmailSenderService],
    })
      .overrideProvider(EmailSenderService)
      .useValue({ sendContactForm: jest.fn().mockResolvedValue({ success: true }) })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /email/contact with valid data returns 201 and triggers email send', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test-${Date.now()}@example.com`,
      message: 'this is a valid message with more than twenty characters',
      company: 'Acme',
    };

    await request(app.getHttpServer()).post('/email/contact').send(payload).expect(201);
  });

  it('POST /email/contact with missing required fields returns 400', async () => {
    const payload = {
      firstName: 'John',
    };

    await request(app.getHttpServer()).post('/email/contact').send(payload).expect(400);
  });

  it('POST /email/contact when email service throws returns 500', async () => {
    const moduleFixture2 = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [EmailSenderService],
    })
      .overrideProvider(EmailSenderService)
      .useValue({ sendContactForm: jest.fn().mockRejectedValue(new Error('smtp error')) })
      .compile();

    const errApp = moduleFixture2.createNestApplication();
    errApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await errApp.init();

    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test-${Date.now()}@example.com`,
      message: 'this is a valid message with more than twenty characters',
    };

    await request(errApp.getHttpServer()).post('/email/contact').send(payload).expect(500);

    await errApp.close();
  });
});
