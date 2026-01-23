export declare enum CircleWalletType {
    DEV_CONTROLLED = "dev_controlled",
    USER_CONTROLLED = "user_controlled"
}
export declare class CircleWallet {
    id: string;
    userId: string;
    walletId: string;
    address: string;
    type: CircleWalletType;
    status: string;
    metadata: {
        label?: string;
        balances?: {
            USDC?: string;
            ARC?: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
