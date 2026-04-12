import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('policy_configs')
export class PolicyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Per-transaction limit in USDC
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 50 })
  maxTransactionAmount: string;

  // Daily spending cap in USDC
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 500 })
  dailySpendingCap: string;

  // Current daily spend
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentDailySpend: string;

  // Last spend reset date
  @Column({ type: 'date', nullable: true })
  lastSpendResetDate: Date;

  // Cooldown period between trades (seconds)
  @Column({ default: 60 })
  cooldownPeriodSeconds: number;

  // Last trade timestamp
  @Column({ type: 'datetime', nullable: true })
  lastTradeTimestamp: Date;

  // Price deviation guard (percentage)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5 })
  maxPriceDeviationPercent: string;

  // Allowed counterparty addresses (JSON array)
  @Column({ type: 'simple-json', default: '[]' })
  allowedAddresses: string[];

  // Risk tolerance (0-1)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  riskTolerance: string;

  // Whether the policy is active
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
