import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Single-row persisted paper portfolio for serverless (Vercel) trading loops. */
@Entity('paper_portfolio_state')
export class PaperPortfolioState {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id = 'singleton';

  @Column({ type: 'float', default: 10_000 })
  cashUsd: number;

  /** JSON map keyed by e.g. BTCUSD — matches TradingLoopService position shape. */
  @Column({ type: 'text', default: '{}' })
  positionsJson: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
