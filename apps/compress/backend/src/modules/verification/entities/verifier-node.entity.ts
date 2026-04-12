import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('verifier_nodes')
export class VerifierNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nodeId: string;

  @Column()
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  reliability: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50 })
  avgLatencyMs: string;

  @Column({ default: 0 })
  successfulVerifications: number;

  @Column({ default: 0 })
  failedVerifications: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
