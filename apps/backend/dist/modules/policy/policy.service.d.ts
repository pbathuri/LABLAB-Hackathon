import { Repository } from 'typeorm';
import { PolicyConfig } from './entities/policy-config.entity';
export interface PolicyValidationResult {
    valid: boolean;
    reason?: string;
    checks: Array<{
        name: string;
        passed: boolean;
        message?: string;
    }>;
}
export interface DecisionForValidation {
    type: string;
    parameters: {
        amount?: number;
        quantity?: number;
        targetAddress?: string;
        price?: number;
    };
}
export declare class PolicyService {
    private policyRepository;
    private readonly logger;
    constructor(policyRepository: Repository<PolicyConfig>);
    getPolicyConfig(userId: string): Promise<PolicyConfig>;
    updatePolicyConfig(userId: string, updates: Partial<PolicyConfig>): Promise<PolicyConfig>;
    validateDecision(userId: string, decision: DecisionForValidation): Promise<PolicyValidationResult>;
    recordTransaction(userId: string, amount: number): Promise<void>;
    private checkCooldown;
    private checkAllowlist;
    private checkPriceDeviation;
    private resetDailySpendIfNeeded;
}
