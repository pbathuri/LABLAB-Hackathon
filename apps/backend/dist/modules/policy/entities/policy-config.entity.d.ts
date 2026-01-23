export declare class PolicyConfig {
    id: string;
    userId: string;
    maxTransactionAmount: string;
    dailySpendingCap: string;
    currentDailySpend: string;
    lastSpendResetDate: Date;
    cooldownPeriodSeconds: number;
    lastTradeTimestamp: Date;
    maxPriceDeviationPercent: string;
    allowedAddresses: string[];
    riskTolerance: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
