import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from '@/modules/users/entities/user.entity';

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ComplianceFramework = 'hipaa' | 'gdpr' | 'custom';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne('User', 'documents', { onDelete: 'CASCADE' })
  user: User;

  @Column('text')
  originalText: string;

  @Column('text', { nullable: true })
  anonymizedText: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: DocumentStatus;

  @Column({ default: 0 })
  entityCount: number;

  @Column({ type: 'int', nullable: true })
  processingTimeMs: number | null;

  @Column({
    type: 'enum',
    enum: ['hipaa', 'gdpr', 'custom'],
    default: 'hipaa',
  })
  framework: ComplianceFramework;

  

  @CreateDateColumn()
  createdAt: Date;
}
