
export default () => ({
  app: {
    host: process.env.HOST ?? "get host error",
    port: parseInt(process.env.PORT ?? 'get port error', 10),
    nodeEnv: process.env.NODE_ENV ?? 'get nodeEnv error',
    corsOrigin: process.env.CORS_ORIGIN ?? 'get cors error',

  },
  db: {
    host: process.env.DB_HOST ?? 'get db host error',
    port: parseInt(process.env.DB_PORT ?? 'get db port error', 10),
    username: process.env.DB_USERNAME ?? 'get db user error',
    password: process.env.DB_PASSWORD ?? 'get db password error',
    name: process.env.DB_NAME ?? 'get db error',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'get jwt secret error',
    expiresIn: process.env.JWT_EXPIRES_IN ?? 'exp jwt error',
  },
  magicLink: {
    expiresInSeconds: parseInt(process.env.MAGIC_LINK_EXPIRES_IN ?? 'exp link error', 10),
  },
  presidio: {
    analyzerUrl: process.env.PRESIDIO_ANALYZER_URL ?? 'analyzer url error',
    anonymizerUrl: process.env.PRESIDIO_ANONYMIZER_URL ?? 'annonymizer url error',
  },
  encryption: {
    
    key: process.env.ENCRYPTION_KEY ?? 'get enc_key error',
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'get mail error',
  },
  seed:{
    adminEmail:process.env.SEED_ADMIN_EMAIL ?? "get admin email error",
    run:process.env.RUN_SEEDS ?? 'run_seed error'
  }
});
