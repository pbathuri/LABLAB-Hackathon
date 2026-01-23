export declare enum GatewayTransferStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class GatewayTransfer {
    id: string;
    userId: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    fromWalletId: string;
    fromAddress: string;
    toAddress: string;
    status: GatewayTransferStatus;
    txHash: string;
    metadata: {
        referenceId?: string;
        notes?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
