import { Repository } from 'typeorm';
import { VerificationLog } from './entities/verification-log.entity';
import { VerifierNode } from './entities/verifier-node.entity';
export interface VerificationRequest {
    type: string;
    userId: string;
    amount?: number;
    recipient?: string;
    parameters: Record<string, any>;
}
export interface VerificationResult {
    verificationId: string;
    requestHash: string;
    approved: boolean;
    signatureCount: number;
    requiredSignatures: number;
    signatures: VerifierSignature[];
    timestamp: Date;
    consensusLatencyMs: number;
}
export interface VerifierSignature {
    verifierId: string;
    address: string;
    signature: string;
    latencyMs: number;
    timestamp: Date;
}
export declare class VerificationService {
    private verificationLogRepository;
    private verifierNodeRepository;
    private readonly logger;
    private readonly TOTAL_VERIFIERS;
    private readonly FAULT_TOLERANCE;
    private readonly REQUIRED_SIGNATURES;
    private verifierNodes;
    constructor(verificationLogRepository: Repository<VerificationLog>, verifierNodeRepository: Repository<VerifierNode>);
    private initializeVerifierNodes;
    verifyTransaction(request: VerificationRequest): Promise<VerificationResult>;
    private collectSignature;
    aggregateSignatures(signatures: VerifierSignature[]): string;
    getVerifierStatus(): Promise<{
        totalNodes: number;
        activeNodes: number;
        faultTolerance: number;
        requiredSignatures: number;
        nodes: Array<{
            id: string;
            address: string;
            reliability: number;
            avgLatencyMs: number;
        }>;
    }>;
    getRecentVerifications(limit?: number): Promise<VerificationLog[]>;
    checkVerification(verificationId: string): Promise<{
        valid: boolean;
        verificationLog?: VerificationLog;
    }>;
    private generateVerificationId;
    private hashRequest;
    private simulateLatency;
}
