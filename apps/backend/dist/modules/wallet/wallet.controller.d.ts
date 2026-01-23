import { WalletService } from './wallet.service';
declare class SettlementDto {
    toAddress: string;
    amount: string;
    asset: string;
}
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    createWallet(req: any): Promise<import("./entities/wallet.entity").Wallet>;
    getWallet(req: any): Promise<import("./entities/wallet.entity").Wallet | null>;
    getBalance(req: any): Promise<Record<string, string>>;
    getTransactions(req: any): Promise<import("./entities/transaction.entity").Transaction[]>;
    executeSettlement(req: any, dto: SettlementDto): Promise<import("./entities/transaction.entity").Transaction>;
}
export {};
