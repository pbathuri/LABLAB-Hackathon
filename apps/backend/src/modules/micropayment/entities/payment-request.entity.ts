import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentModel {
  PAY_PER_CALL = 'pay_per_call',
  PAY_ON_SUCCESS = 'pay_on_success',
  BUNDLED = 'bundled',
}

@Entity('payment_requests')
export class PaymentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  payer: string;

  @Column()
  payee: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ default: 'USDC' })
  asset: string;

  @Column()
  nonce: string;

  @Column({ type: 'bigint' })
  expiry: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentModel,
    default: PaymentModel.PAY_PER_CALL,
  })
  model: PaymentModel;

  @Column({ nullable: true })
  apiEndpoint: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ type: 'text', nullable: true })
  signature: string;

  @Column({ type: 'text', nullable: true })
  eip712TypedData: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    callResult?: any;
    errorMessage?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
