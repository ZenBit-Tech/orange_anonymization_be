/**
 * User Entity
 * Key design decisions:
 *   - UUID primary key (prevent enumeration attacks)
 *   - @Index on email for fast lookups (login, magic link)
 *   - @OneToMany to documents (lazy — not eagerly loaded to avoid N+1)
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Document } from '@/modules/presidio/entities/document.entity';

export type UserRole = 'admin' | 'analyst' | 'viewer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({
    type: 'enum',
    enum: ['admin', 'analyst', 'viewer'],
    default: 'analyst',
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true, select: false })
  magicLinkToken: string | null;

  @Column({ nullable: true, type: 'datetime', select: false })
  magicLinkExpiresAt: Date | null;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Document', 'user')
  documents: Document[];
}
