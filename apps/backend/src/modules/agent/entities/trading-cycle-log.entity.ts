import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trading_cycle_logs')
export class TradingCycleLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-json' })
  marketScan: Record<string, unknown>;

  @Column({ type: 'simple-json', nullable: true })
  signals: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  reasoning: string;

  @Column({ type: 'simple-json', nullable: true })
  functionCalls: Array<{ name: string; args: Record<string, unknown> }>;

  @Column({ type: 'simple-json', nullable: true })
  executionResults: unknown;

  @Column({ default: false })
  reputationPosted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
