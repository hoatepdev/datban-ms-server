import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class UserTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Additional columns for user statistics
  @Column({ name: 'total_reservations', default: 0 })
  totalReservations: number;

  @Column({ name: 'active_reservations', default: 0 })
  activeReservations: number;

  @Column({ name: 'cancelled_reservations', default: 0 })
  cancelledReservations: number;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;
}
