
export default () => ({
  app: {
    host: process.env.HOST ?? "get host error",
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
  }
});
