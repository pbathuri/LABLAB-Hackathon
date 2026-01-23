import { AgentService } from './agent.service';
declare class MakeDecisionDto {
    instruction?: string;
    portfolioState: Record<string, number>;
    marketData?: Record<string, any>;
    riskTolerance?: number;
}
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    makeDecision(req: any, dto: MakeDecisionDto): Promise<import("./entities/agent-decision.entity").AgentDecision>;
    executeDecision(id: string): Promise<import("./entities/agent-decision.entity").AgentDecision>;
    explainDecision(id: string): Promise<{
        explanation: string;
    }>;
    getHistory(req: any): Promise<import("./entities/agent-decision.entity").AgentDecision[]>;
}
export {};
