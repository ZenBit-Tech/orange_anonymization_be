export default () => ({
  app: {
    host: process.env.HOST ?? 'get host error',
    port: parseInt(process.env.PORT ?? 'get port error', 10),
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
  mail: {
    host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    user: process.env.MAIL_USER ?? '',
    appPassword: process.env.MAIL_APP_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER ?? '',
  },
});
