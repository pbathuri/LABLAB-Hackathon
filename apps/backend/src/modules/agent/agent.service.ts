import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiService, TradingDecision } from './services/gemini.service';
import {
  AgentDecision,
  DecisionType,
  DecisionStatus,
} from './entities/agent-decision.entity';
import { VerificationService } from '../verification/verification.service';
import { QuantumService } from '../quantum/quantum.service';
import { PolicyService } from '../policy/policy.service';

export interface AgentContext {
  userId: string;
  portfolioState: Record<string, number>;
  marketData: Record<string, any>;
  riskTolerance: number;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(AgentDecision)
    private decisionRepository: Repository<AgentDecision>,
    private geminiService: GeminiService,
    private verificationService: VerificationService,
    private quantumService: QuantumService,
    private policyService: PolicyService,
  ) {}

  /**
   * Main entry point for autonomous agent decision-making
   */
  async makeDecision(context: AgentContext): Promise<AgentDecision> {
    this.logger.log(`Making decision for user ${context.userId}`);

    // Step 1: Get quantum-optimized portfolio weights
    const quantumAnalysis = await this.quantumService.optimizePortfolio(
      context.portfolioState,
      context.riskTolerance,
    );

    // Step 2: Get AI trading decision
    const aiDecision = await this.geminiService.generateTradingDecision(
      context.portfolioState,
      {
        ...context.marketData,
        quantumOptimization: quantumAnalysis,
      },
      context.riskTolerance,
    );

    // Step 3: Create decision record
    const decision = this.decisionRepository.create({
      userId: context.userId,
      type: this.mapActionToType(aiDecision.action),
      status: DecisionStatus.PENDING,
      parameters: {
        asset: aiDecision.asset,
        quantity: aiDecision.quantity,
      },
      reasoning: aiDecision.reasoning,
      quantumAnalysis: {
        optimizedWeights: quantumAnalysis.weights,
        expectedReturn: quantumAnalysis.expectedReturn,
        riskMetrics: {
          variance: quantumAnalysis.variance,
          sharpeRatio: quantumAnalysis.sharpeRatio,
        },
      },
    });

    await this.decisionRepository.save(decision);

    // Step 4: Validate against policy rules
    const policyCheck = await this.policyService.validateDecision(
      context.userId,
      decision,
    );

    if (!policyCheck.valid) {
      decision.status = DecisionStatus.REJECTED;
      decision.reasoning += `\n\n⚠️ Policy violation: ${policyCheck.reason}`;
      await this.decisionRepository.save(decision);
      return decision;
    }

    // Step 5: Submit for BFT verification
    decision.status = DecisionStatus.VERIFYING;
    await this.decisionRepository.save(decision);

    const verificationResult = await this.verificationService.verifyDecision(decision);

    decision.verificationResult = verificationResult;
    decision.status = verificationResult.consensusReached
      ? DecisionStatus.VERIFIED
      : DecisionStatus.REJECTED;

    await this.decisionRepository.save(decision);

    return decision;
  }

  /**
   * Execute a verified decision
   */
  async executeDecision(decisionId: string): Promise<AgentDecision> {
    const decision = await this.decisionRepository.findOne({
      where: { id: decisionId },
    });

    if (!decision) {
      throw new BadRequestException('Decision not found');
    }

    if (decision.status !== DecisionStatus.VERIFIED) {
      throw new BadRequestException('Decision not verified');
    }

    // TODO: Execute actual blockchain transaction
    // This would integrate with Circle USDC and Arc testnet

    decision.status = DecisionStatus.EXECUTED;
    decision.transactionHash = `0x${this.generateMockTxHash()}`;

    await this.decisionRepository.save(decision);

    return decision;
  }

  /**
   * Get decision explanation from Captain Whiskers
   */
  async explainDecision(decisionId: string): Promise<string> {
    const decision = await this.decisionRepository.findOne({
      where: { id: decisionId },
    });

    if (!decision) {
      throw new BadRequestException('Decision not found');
    }

    const tradingDecision: TradingDecision = {
      action: this.mapTypeToAction(decision.type),
      asset: decision.parameters.asset,
      quantity: decision.parameters.quantity,
      reasoning: decision.reasoning,
      confidence: 0.8,
      riskLevel: 'medium',
    };

    return this.geminiService.explainDecision(tradingDecision);
  }

  /**
   * Get user's decision history
   */
  async getDecisionHistory(
    userId: string,
    limit = 20,
  ): Promise<AgentDecision[]> {
    return this.decisionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private mapActionToType(action: string): DecisionType {
    const mapping: Record<string, DecisionType> = {
      buy: DecisionType.BUY,
      sell: DecisionType.SELL,
      hold: DecisionType.HOLD,
      rebalance: DecisionType.REBALANCE,
    };
    return mapping[action] || DecisionType.HOLD;
  }

  private mapTypeToAction(type: DecisionType): 'buy' | 'sell' | 'hold' | 'rebalance' {
    const mapping: Record<DecisionType, 'buy' | 'sell' | 'hold' | 'rebalance'> = {
      [DecisionType.BUY]: 'buy',
      [DecisionType.SELL]: 'sell',
      [DecisionType.HOLD]: 'hold',
      [DecisionType.REBALANCE]: 'rebalance',
      [DecisionType.PURCHASE_API]: 'buy',
    };
    return mapping[type];
  }

  private generateMockTxHash(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  }
}
