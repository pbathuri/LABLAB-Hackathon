export declare enum PaymentStatus {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum PaymentModel {
    PAY_PER_CALL = "pay_per_call",
    PAY_ON_SUCCESS = "pay_on_success",
    BUNDLED = "bundled"
}
export declare class PaymentRequest {
    id: string;
    userId: string;
    payer: string;
    payee: string;
    amount: string;
    asset: string;
    nonce: string;
    expiry: number;
    status: PaymentStatus;
    model: PaymentModel;
    apiEndpoint: string;
    providerId: string;
    signature: string;
    eip712TypedData: string;
    metadata: {
        description?: string;
        callResult?: any;
        errorMessage?: string;
        gatewayTransferId?: string;
        gatewayTxHash?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
