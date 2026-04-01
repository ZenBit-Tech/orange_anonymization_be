import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/auth/entities/user.entity';

dotenv.config();

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@clinical-studio.local';

  const existing = await repo.findOneBy({ email: adminEmail });
  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    await AppDataSource.destroy();
    return;
  }

  const admin = repo.create({
    email: adminEmail,
    role: 'admin',
    isActive: true,
  });
  await repo.save(admin);

  console.log(`Created admin user: ${adminEmail} (id: ${admin.id})`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
