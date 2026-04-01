import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed(): Promise<void> {}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
