import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  endpoint: string;

  @Column({ nullable: true })
  description: string;

  // Historical success rate (0-1)
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  successRate: string;

  // Average latency in milliseconds
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageLatencyMs: string;

  // Total number of calls
  @Column({ default: 0 })
  totalCalls: number;

  // Successful calls
  @Column({ default: 0 })
  successfulCalls: number;

  // Calculated reliability score
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  reliabilityScore: string;

  // Whether provider is blacklisted
  @Column({ default: false })
  isBlacklisted: boolean;

  // Cost per call in USDC
  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  costPerCall: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
