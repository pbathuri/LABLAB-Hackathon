import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
export declare class WalletService {
    private walletRepository;
    private transactionRepository;
    private configService;
    private readonly logger;
    private provider;
    constructor(walletRepository: Repository<Wallet>, transactionRepository: Repository<Transaction>, configService: ConfigService);
    createWallet(userId: string): Promise<Wallet>;
    getWallet(userId: string): Promise<Wallet | null>;
    getBalance(walletId: string): Promise<Record<string, string>>;
    recordTransaction(walletId: string, type: TransactionType, asset: string, amount: string, metadata?: Record<string, any>): Promise<Transaction>;
    getTransactionHistory(walletId: string, limit?: number): Promise<Transaction[]>;
    executeSettlement(walletId: string, toAddress: string, amount: string, asset: string): Promise<Transaction>;
    private generateMockTxHash;
}
