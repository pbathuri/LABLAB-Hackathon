export declare class Wallet {
    id: string;
    userId: string;
    address: string;
    balances: Record<string, string>;
    network: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
