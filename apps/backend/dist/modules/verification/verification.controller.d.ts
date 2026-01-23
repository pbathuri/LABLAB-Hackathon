import { VerificationService } from './verification.service';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    getStats(): Promise<{
        signedCount: number;
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
    getRecent(): Promise<import("./entities/verification-log.entity").VerificationLog[]>;
    getLogs(verificationId: string): Promise<{
        valid: boolean;
        verificationLog?: import("./entities/verification-log.entity").VerificationLog;
    }>;
}
