/* eslint-disable no-restricted-syntax -- this file is the designated process.env boundary */
const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value: string | undefined): boolean => value === 'true';

export default () => ({
  app: {
    host: process.env.HOST ?? '0.0.0.0',
    port: toInt(process.env.PORT, toInt(process.env.DEFAULT_APP_PORT, 3000)),
    corsOrigin: process.env.CORS_ORIGIN ?? process.env.DEFAULT_CORS_ORIGIN ?? 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV ?? process.env.DEFAULT_NODE_ENV ?? 'development',
    frontendUrl: process.env.FRONTEND_URL ?? '',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, toInt(process.env.DEFAULT_DB_PORT, 3306)),
    username: process.env.DB_USERNAME ?? process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
    name: process.env.DB_NAME ?? '',
    synchronize: toBool(process.env.DB_SYNCHRONIZE),
    logging: toBool(process.env.DB_LOGGING),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY ?? '',
  },
  presidio: {
    analyzerUrl: process.env.PRESIDIO_ANALYZER_URL ?? '',
    anonymizerUrl: process.env.PRESIDIO_ANONYMIZER_URL ?? '',
  },
  mail: {
    host: process.env.MAIL_HOST ?? '',
    port: toInt(process.env.MAIL_PORT, toInt(process.env.DEFAULT_MAIL_PORT, 587)),
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER ?? '',
  },
});
