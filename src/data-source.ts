import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './modules/auth/entities/user.entity';
import { CreateUsersTable1680000000000 } from './migrations/1680000000000-CreateUsersTable';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  migrations: [CreateUsersTable1680000000000],
  synchronize: false,
});
