import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GeminiTradingService } from './services/gemini-trading.service';
import { GeminiFunctionExecutorService } from './services/gemini-function-executor.service';
import { KrakenPaperService } from '../kraken/kraken-paper.service';
import { PrismService } from '../prism/prism.service';
import { PerformanceService } from './services/performance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradingCycleLog } from './entities/trading-cycle-log.entity';
import { AgentInstructDto } from './dto/agent-instruct.dto';

@ApiTags('agent')
@Controller('api/agent')
export class AgentInstructController {
  constructor(
    private readonly gemini: GeminiTradingService,
    private readonly functionExecutor: GeminiFunctionExecutorService,
    private readonly krakenPaper: KrakenPaperService,
    private readonly prism: PrismService,
    private readonly performance: PerformanceService,
    @InjectRepository(TradingCycleLog)
    private readonly cycles: Repository<TradingCycleLog>,
  ) { }

  @Post('instruct')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @ApiOperation({ summary: 'Natural language trading instruction (Gemini + tools)' })
  async instruct(@Body() dto: AgentInstructDto) {
    const status = await this.krakenPaper.status();
    let signals: Record<string, unknown> | undefined;
    let risk: Record<string, unknown> | undefined;
    try {
      signals = (await this.prism.signals('BTC')) as Record<string, unknown>;
    } catch {
      /* optional */
    }
    try {
      risk = (await this.prism.risk('BTC')) as Record<string, unknown>;
    } catch {
      /* optional */
    }
    const decision = await this.gemini.processInstruction(dto.instruction, {
      portfolio: status.data ?? status,
      signals,
      riskMetrics: risk,
    });

    const executionResults: Array<{
      name: string;
      args: Record<string, unknown>;
      result: unknown;
    }> = [];
    for (const call of decision.functionCalls) {
      const result = await this.functionExecutor.executeCall(call);
      executionResults.push({
        name: call.name,
        args: call.args,
        result,
      });
    }

    return {
      reasoning: decision.reasoning,
      functionCalls: decision.functionCalls,
      executionResults,
      raw: decision.raw,
    };
  }

  @Get('performance')
  @ApiOperation({ summary: 'Current performance metrics snapshot' })
  async performanceSnapshot() {
    const m = this.performance.getDailyMetrics();
    const cycleCount = await this.cycles.count();
    return {
      ...m,
      lastNav: this.performance.getLastNav(),
      totalTrades: cycleCount,
    };
  }

  @Get('cycles')
  @ApiOperation({ summary: 'Recent trading cycle logs' })
  async recentCycles(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.cycles.find({
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }
}
