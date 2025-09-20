import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('domain_events')
@Index(['aggregateId'])
@Index(['eventName'])
@Index(['occurredAt'])
export class DomainEventTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_name', length: 100 })
  eventName: string;

  @Column({ name: 'event_version', length: 10 })
  eventVersion: string;

  @Column({ name: 'aggregate_id', length: 255 })
  aggregateId: string;

  @Column({ name: 'aggregate_type', length: 100 })
  aggregateType: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;

  @Column({ name: 'processed_at', nullable: true })
  processedAt?: Date;

  @Column({ name: 'is_processed', default: false })
  isProcessed: boolean;
}
