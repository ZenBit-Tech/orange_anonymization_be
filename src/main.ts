import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const NODE_ENV_PRODUCTION = 'production';
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 3000;

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const host = configService.get<string>('app.host') ?? DEFAULT_HOST;
  const port = configService.get<number>('app.port') ?? DEFAULT_PORT;
  const corsOrigin = configService.get<string>('app.corsOrigin') ?? '';
  const nodeEnv = configService.get<string>('app.nodeEnv');

  // CORS
  // Allow the React frontend (Vite dev server) to call this API.
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  //Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger available in non-production environments only
  if (nodeEnv !== NODE_ENV_PRODUCTION) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Clinical Data Studio API')
      .setDescription(
        'REST API for clinical text de-identification and synthetic data generation.\n\n' +
          '**Authentication:** Use the magic link flow to get a JWT, then click "Authorize" and paste it.\n\n' +
          '**Presidio endpoints** require the Docker containers to be running:\n' +
          '- `POST /api/de-identification/analyze` → calls presidio-analyzer:5001\n' +
          '- `POST /api/de-identification/anonymize` → calls presidio-anonymizer:5002',
      )
      .setVersion('1.0')
      .addBearerAuth() // enables the 🔒 Authorize button in Swagger UI
      .addTag('Auth', 'Magic link authentication flow')
      .addTag('Users', 'User management')
      .addTag('De-Identification', 'PII detection and anonymization via Presidio')
      .addTag('Synthetic Data', 'Synthetic patient data generation')
      .addTag('Dashboard', 'Metrics and activity data')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // keeps the JWT token when page is refreshed
        docExpansion: 'list',
      },
    });
  }

  await app.listen(port, host);
  logger.log(`📡 Listening on port ${port}`);
  if (nodeEnv !== NODE_ENV_PRODUCTION) {
    logger.log(`📖 Swagger UI: http://${host}:${port}/api/docs`);
  }
}

void bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Fatal error during bootstrap', err);
  process.exit(1);
});
