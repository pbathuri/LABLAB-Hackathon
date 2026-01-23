export declare enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
    TRADE = "trade",
    MICROPAYMENT = "micropayment",
    SETTLEMENT = "settlement"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}
export declare class Transaction {
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    asset: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
    transactionHash: string;
    blockNumber: number;
    metadata: Record<string, any>;
    createdAt: Date;
}
