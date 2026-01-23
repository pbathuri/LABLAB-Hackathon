import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('verification_logs')
export class VerificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  verificationId: string;

  @Column()
  requestHash: string;

  @Column()
  requestType: string;

  @Column()
  userId: string;

  @Column()
  signatureCount: number;

  @Column()
  requiredSignatures: number;

  @Column()
  consensusReached: boolean;

  @Column()
  consensusLatencyMs: number;

  @Column({ type: 'simple-json' })
  signatures: string;

  @Column({ nullable: true })
  onChainTxHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
