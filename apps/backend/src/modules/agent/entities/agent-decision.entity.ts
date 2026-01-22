import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DecisionType {
  BUY = 'buy',
  SELL = 'sell',
  HOLD = 'hold',
  REBALANCE = 'rebalance',
  PURCHASE_API = 'purchase_api',
}

export enum DecisionStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  FAILED = 'failed',
}

@Entity('agent_decisions')
export class AgentDecision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: DecisionType,
  })
  type: DecisionType;

  @Column({
    type: 'enum',
    enum: DecisionStatus,
    default: DecisionStatus.PENDING,
  })
  status: DecisionStatus;

  @Column({ type: 'jsonb' })
  parameters: {
    asset?: string;
    quantity?: number;
    price?: number;
    targetAddress?: string;
    apiEndpoint?: string;
    amount?: number;
  };

  @Column({ type: 'text' })
  reasoning: string;

  @Column({ type: 'jsonb', nullable: true })
  quantumAnalysis: {
    optimizedWeights: Record<string, number>;
    expectedReturn: number;
    riskMetrics: {
      variance: number;
      sharpeRatio: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  verificationResult: {
    totalSignatures: number;
    requiredSignatures: number;
    verifierAddresses: string[];
    consensusReached: boolean;
    timestamp: string;
  };

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ type: 'text', nullable: true })
  postQuantumSignature: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
