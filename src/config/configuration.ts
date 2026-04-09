/* eslint-disable no-restricted-syntax -- this file is the designated process.env boundary */
const DEFAULT_APP_PORT = 3000;
const DEFAULT_DB_PORT = 3306;
const DEFAULT_MAIL_PORT = 587;

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value: string | undefined): boolean => value === 'true';

export default () => ({
  app: {
    host: process.env.HOST ?? '0.0.0.0',
    port: toInt(process.env.PORT, DEFAULT_APP_PORT),
    corsOrigin: process.env.CORS_ORIGIN ?? '',
    nodeEnv: process.env.NODE_ENV ?? '',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, DEFAULT_DB_PORT),
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
    port: toInt(process.env.MAIL_PORT, DEFAULT_MAIL_PORT),
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
  },
});
