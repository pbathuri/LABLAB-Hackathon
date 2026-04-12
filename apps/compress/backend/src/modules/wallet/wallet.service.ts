import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private provider: ethers.JsonRpcProvider;

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private configService: ConfigService,
  ) {
    // Initialize Arc testnet provider
    const rpcUrl = this.configService.get(
      'ARC_RPC_URL',
      'https://rpc.testnet.arc.dev',
    );
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Create a new wallet for user
   */
  async createWallet(userId: string): Promise<Wallet> {
    // Generate new wallet
    const ethWallet = ethers.Wallet.createRandom();

    const wallet = this.walletRepository.create({
      userId,
      address: ethWallet.address,
      balances: {
        USDC: '0',
        ETH: '0',
      },
      network: 'arc-testnet',
    });

    await this.walletRepository.save(wallet);
    this.logger.log(`Created wallet ${wallet.address} for user ${userId}`);

    return wallet;
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<Wallet | null> {
    return this.walletRepository.findOne({ where: { userId } });
  }

  /**
   * Get wallet balance from blockchain
   */
  async getBalance(walletId: string): Promise<Record<string, string>> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    try {
      // Get native balance
      const ethBalance = await this.provider.getBalance(wallet.address);
      
      // For demo, return stored balances + actual ETH balance
      return {
        ...wallet.balances,
        ETH: ethers.formatEther(ethBalance),
      };
    } catch (error) {
      this.logger.error('Failed to fetch balance:', error);
      return wallet.balances;
    }
  }

  /**
   * Record a transaction
   */
  async recordTransaction(
    walletId: string,
    type: TransactionType,
    asset: string,
    amount: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const transaction = this.transactionRepository.create({
      walletId,
      type,
      asset,
      amount,
      fromAddress: wallet.address,
      metadata,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    walletId: string,
    limit = 50,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Execute a settlement on Arc testnet
   */
  async executeSettlement(
    walletId: string,
    toAddress: string,
    amount: string,
    asset: string,
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Create transaction record
    const transaction = this.transactionRepository.create({
      walletId,
      type: TransactionType.SETTLEMENT,
      asset,
      amount,
      fromAddress: wallet.address,
      toAddress,
      status: TransactionStatus.PENDING,
    });

    await this.transactionRepository.save(transaction);

    // In production, execute actual blockchain transaction here
    // For demo, simulate success
    transaction.status = TransactionStatus.CONFIRMED;
    transaction.transactionHash = `0x${this.generateMockTxHash()}`;
    transaction.blockNumber = Math.floor(Math.random() * 1000000);

    await this.transactionRepository.save(transaction);

    this.logger.log(
      `Settlement executed: ${amount} ${asset} to ${toAddress}`,
    );

    return transaction;
  }

  private generateMockTxHash(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  }
}
