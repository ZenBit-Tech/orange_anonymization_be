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

  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];

  @CreateDateColumn()
  createdAt: Date;
}
