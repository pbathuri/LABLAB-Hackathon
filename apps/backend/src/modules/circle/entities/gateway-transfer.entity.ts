import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GatewayTransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('gateway_transfers')
export class GatewayTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  sourceChain: string;

  @Column()
  destinationChain: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ nullable: true })
  fromWalletId: string;

  @Column({ nullable: true })
  fromAddress: string;

  @Column({ nullable: true })
  toAddress: string;

  @Column({
    type: 'enum',
    enum: GatewayTransferStatus,
    default: GatewayTransferStatus.PENDING,
  })
  status: GatewayTransferStatus;

  @Column({ nullable: true })
  txHash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    referenceId?: string;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
