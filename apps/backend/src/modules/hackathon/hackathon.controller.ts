import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonService } from './hackathon.service';

class SubmitIntentDto {
  @IsString()
  pair!: string;

  @IsString()
  action!: string;

  @Type(() => Number)
  @IsNumber()
  amountUsd!: number;

  @IsString()
  reasoningText!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pnlSnapshot?: number;
}

class PostCheckpointDto {
  @IsString()
  action!: string;

  @IsString()
  pair!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsString()
  reasoning!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore!: number;

  @Type(() => Number)
  @IsNumber()
  pnlSnapshot!: number;
}

class SubmitFeedbackDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsString()
  action!: string;

  @Type(() => Number)
  @IsNumber()
  pnlPercent!: number;

  @IsBoolean()
  executed!: boolean;

  @IsString()
  pair!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  feedbackType?: number;
}

@ApiTags('hackathon')
@Controller('api/hackathon')
export class HackathonController {
  constructor(private readonly hackathon: HackathonService) { }

  @Get('status')
  @ApiOperation({ summary: 'Hackathon service status + contract addresses' })
  status() {
    return this.hackathon.getStatus();
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register agent on Sepolia AgentRegistry + claim vault allocation',
  })
  async register() {
    try {
      const agentId = await this.hackathon.initializeAgent();
      return { success: true, agentId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  @Post('intent')
  @ApiOperation({
    summary:
      'Submit trade intent to hackathon RiskRouter (increments leaderboard intents)',
  })
  async submitIntent(@Body() dto: SubmitIntentDto) {
    const agentId = this.hackathon.agentId;
    if (!agentId) {
      return {
        success: false,
        error:
          'Agent not registered — call POST /api/hackathon/register first',
      };
    }
    try {
      const result = await this.hackathon.submitTradeIntent({
        agentId,
        pair: dto.pair || 'BTC/USD',
        action: dto.action || 'HOLD',
        amountUsd: dto.amountUsd || 950,
        reasoningText: dto.reasoningText || 'Manual intent submission',
        confidenceScore: dto.confidenceScore ?? 0.8,
        pnlSnapshot: dto.pnlSnapshot,
      });
      return { success: true, result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  @Post('checkpoint')
  @ApiOperation({
    summary:
      'Post validation checkpoint to ValidationRegistry (affects validation score)',
  })
  async postCheckpoint(@Body() dto: PostCheckpointDto) {
    const agentId = this.hackathon.agentId;
    if (!agentId) {
      return { success: false, error: 'Agent not registered' };
    }
    try {
      const txHash = await this.hackathon.postCheckpoint(
        agentId,
        {
          action: dto.action,
          pair: dto.pair,
          price: dto.price,
          reasoning: dto.reasoning,
        },
        dto.confidenceScore,
        dto.pnlSnapshot,
      );
      return { success: true, txHash };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit reputation feedback to ReputationRegistry' })
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    const agentId = this.hackathon.agentId;
    if (!agentId) {
      return { success: false, error: 'Agent not registered' };
    }
    try {
      const txHash = await this.hackathon.submitFeedback(
        agentId,
        dto.score,
        {
          action: dto.action,
          pnlPercent: dto.pnlPercent,
          executed: dto.executed,
          pair: dto.pair,
          reason: dto.reason,
        },
        dto.feedbackType ?? 0,
      );
      return { success: true, txHash };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  @Get('nonce')
  @ApiOperation({ summary: 'Get current intent nonce for the registered agent' })
  async getNonce() {
    const agentId = this.hackathon.agentId;
    if (!agentId) {
      return { agentId: null, nonce: null, error: 'Not registered' };
    }
    const nonce = await this.hackathon.getIntentNonce(agentId);
    return { agentId, nonce };
  }
}
