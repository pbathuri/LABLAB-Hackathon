import { PolicyService } from './policy.service';
declare class UpdatePolicyDto {
    maxTransactionAmount?: string;
    dailySpendingCap?: string;
    cooldownPeriodSeconds?: number;
    maxPriceDeviationPercent?: string;
    allowedAddresses?: string[];
    riskTolerance?: string;
}
export declare class PolicyController {
    private readonly policyService;
    constructor(policyService: PolicyService);
    getPolicy(req: any): Promise<import("./entities/policy-config.entity").PolicyConfig>;
    updatePolicy(req: any, dto: UpdatePolicyDto): Promise<import("./entities/policy-config.entity").PolicyConfig>;
}
export {};
