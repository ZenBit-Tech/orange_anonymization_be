import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('synthetic_records')
export class SyntheticRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  entityType: string;

  @Column('text')
  value: string;

  @Column({ default: 'en_US' })
  locale: string;

  @CreateDateColumn()
  createdAt: Date;
}
