import { QRNGService } from './services/qrng.service';
export interface PortfolioOptimizationResult {
    weights: Record<string, number>;
    expectedReturn: number;
    variance: number;
    sharpeRatio: number;
    quantumIterations: number;
    convergenceAchieved: boolean;
}
export interface AssetData {
    symbol: string;
    expectedReturn: number;
    historicalReturns: number[];
}
export declare class QuantumService {
    private qrngService;
    private readonly logger;
    constructor(qrngService: QRNGService);
    optimizePortfolio(holdings: Record<string, number>, riskTolerance: number): Promise<PortfolioOptimizationResult>;
    private runVQEOptimization;
    private calculateCost;
    private calculatePortfolioVariance;
    private calculatePortfolioReturn;
    private calculateCovarianceMatrix;
    private covariance;
    private generateAssetData;
    private getDefaultResult;
}
