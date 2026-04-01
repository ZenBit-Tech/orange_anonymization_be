
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';

dotenv.config();

async function seed(): Promise<void> {
  
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
