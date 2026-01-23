import { Repository } from 'typeorm';
import { GeminiService } from './services/gemini.service';
import { AgentDecision } from './entities/agent-decision.entity';
import { VerificationService } from '../verification/verification.service';
import { QuantumService } from '../quantum/quantum.service';
import { PolicyService } from '../policy/policy.service';
export interface AgentContext {
    userId: string;
    instruction: string;
    portfolioState: Record<string, number>;
    marketData: Record<string, any>;
    riskTolerance: number;
}
export declare class AgentService {
    private decisionRepository;
    private geminiService;
    private verificationService;
    private quantumService;
    private policyService;
    private readonly logger;
    constructor(decisionRepository: Repository<AgentDecision>, geminiService: GeminiService, verificationService: VerificationService, quantumService: QuantumService, policyService: PolicyService);
    makeDecision(context: AgentContext): Promise<AgentDecision>;
    executeDecision(decisionId: string): Promise<AgentDecision>;
    explainDecision(decisionId: string): Promise<string>;
    getDecisionHistory(userId: string, limit?: number): Promise<AgentDecision[]>;
    private mapActionToType;
    private mapTypeToAction;
    private generateMockTxHash;
}
