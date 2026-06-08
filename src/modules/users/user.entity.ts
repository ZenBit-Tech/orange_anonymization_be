import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/entities/job.entity';

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  magicLinkToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  magicLinkExpiresAt: Date | null;

  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];

  @CreateDateColumn()
  createdAt: Date;
}
