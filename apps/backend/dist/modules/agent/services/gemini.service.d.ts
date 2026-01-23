import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface FunctionCall {
    name: string;
    parameters: Record<string, any>;
}
export interface AgentDecision {
    action: 'BUY' | 'SELL' | 'HOLD' | 'TRANSFER' | 'OPTIMIZE';
    confidence: number;
    reasoning: string;
    parameters: Record<string, any>;
    functionCalls: FunctionCall[];
}
export interface AnalysisResult {
    summary: string;
    risks: string[];
    opportunities: string[];
    recommendations: string[];
    sentiment: 'bullish' | 'bearish' | 'neutral';
}
export declare class GeminiService implements OnModuleInit {
    private configService;
    private readonly logger;
    private apiKey;
    private baseUrl;
    private readonly availableFunctions;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    processInstruction(instruction: string, context: {
        portfolio?: any;
        policy?: any;
        recentTransactions?: any[];
    }): Promise<AgentDecision>;
    analyzePortfolio(portfolio: any, marketData: any): Promise<AnalysisResult>;
    explainDecision(decision: AgentDecision): Promise<string>;
    private buildPrompt;
    private callGemini;
    private parseResponse;
    private parseAnalysis;
    private mockDecision;
    private mockAnalysis;
    private mockExplanation;
}
