import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CircleWalletType {
  DEV_CONTROLLED = 'dev_controlled',
  USER_CONTROLLED = 'user_controlled',
}

@Entity('circle_wallets')
export class CircleWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  walletId: string;

  @Column()
  address: string;

  @Column({ type: 'varchar', length: 50, default: CircleWalletType.DEV_CONTROLLED })
  type: CircleWalletType;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    label?: string;
    balances?: {
      USDC?: string;
      ARC?: string;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
