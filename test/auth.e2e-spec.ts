import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { UsersService } from '@/modules/users/users.service';
import { EmailSenderService } from '@/modules/email/services/email-sender.service';
import * as crypto from 'crypto';

describe('Auth E2E', () => {
  let app: INestApplication;
  let usersService: UsersService;

  const email = `test-${Date.now()}@example.com`;
  let magicToken: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailSenderService)
      .useValue({
        requestMagicLink: jest.fn().mockResolvedValue({
          message: 'Magic link sent to your email',
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login with valid email returns 200', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({ email }).expect(200);
  });

  it('POST /auth/login with invalid email returns 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-email' })
      .expect(400);
  });

  it('GET /auth/verify with valid token returns JWT', async () => {
    const user = await usersService.upsert(email);

    magicToken = crypto.randomBytes(16).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await usersService.updateMagicLink(user.id, magicToken, expires);

    const res = await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: magicToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();

    accessToken = res.body.accessToken;
  });

  it('GET /auth/verify with already-used token returns 401', async () => {
    await request(app.getHttpServer()).get('/auth/verify').query({ token: magicToken }).expect(401);
  });

  it('GET /auth/verify with expired token returns 401', async () => {
    const user = await usersService.upsert('expired@example.com');

    const expiredToken = crypto.randomBytes(16).toString('hex');
    const expiredDate = new Date(Date.now() - 1000);

    await usersService.updateMagicLink(user.id, expiredToken, expiredDate);

    await request(app.getHttpServer())
      .get('/auth/verify')
      .query({ token: expiredToken })
      .expect(401);
  });

  it('GET /users/me with valid JWT returns user', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(email);
  });

  it('GET /users/me without token returns 401', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });
});
