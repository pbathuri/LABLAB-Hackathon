export declare enum DecisionType {
    BUY = "buy",
    SELL = "sell",
    HOLD = "hold",
    REBALANCE = "rebalance",
    PURCHASE_API = "purchase_api"
}
export declare enum DecisionStatus {
    PENDING = "pending",
    VERIFYING = "verifying",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXECUTED = "executed",
    FAILED = "failed"
}
export declare class AgentDecision {
    id: string;
    userId: string;
    type: DecisionType;
    status: DecisionStatus;
    parameters: {
        asset?: string;
        quantity?: number;
        price?: number;
        targetAddress?: string;
        apiEndpoint?: string;
        amount?: number;
    };
    reasoning: string;
    quantumAnalysis: {
        optimizedWeights: Record<string, number>;
        expectedReturn: number;
        riskMetrics: {
            variance: number;
            sharpeRatio: number;
        };
    };
    verificationResult: {
        totalSignatures: number;
        requiredSignatures: number;
        verifierAddresses: string[];
        consensusReached: boolean;
        timestamp: string;
    };
    transactionHash: string;
    postQuantumSignature: string;
    createdAt: Date;
    updatedAt: Date;
}
