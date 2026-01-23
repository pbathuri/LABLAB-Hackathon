export declare class VerificationLog {
    id: string;
    verificationId: string;
    requestHash: string;
    requestType: string;
    userId: string;
    signatureCount: number;
    requiredSignatures: number;
    consensusReached: boolean;
    consensusLatencyMs: number;
    signatures: string;
    onChainTxHash: string;
    createdAt: Date;
}
