
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/auth/entities/user.entity';
import { Document } from '../modules/de-identification/entities/document.entity';
import { SyntheticRecord } from '../modules/synthetic-data/entities/synthetic-record.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'clinical_studio',
  entities: [User, Document, SyntheticRecord],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,  
  logging: false,
});
