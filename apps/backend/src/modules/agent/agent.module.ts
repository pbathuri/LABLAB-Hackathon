import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { AgentInstructController } from './agent-instruct.controller';
import { AgentCronController } from './agent-cron.controller';
import { GeminiService } from './services/gemini.service';
import { GeminiTradingService } from './services/gemini-trading.service';
import { PerformanceService } from './services/performance.service';
import { TradingLoopService } from './services/trading-loop.service';
import { GeminiFunctionExecutorService } from './services/gemini-function-executor.service';
import { AgentDecision } from './entities/agent-decision.entity';
import { TradingCycleLog } from './entities/trading-cycle-log.entity';
import { VerificationModule } from '../verification/verification.module';
import { QuantumModule } from '../quantum/quantum.module';
import { PolicyModule } from '../policy/policy.module';
import { KrakenModule } from '../kraken/kraken.module';
import { PrismModule } from '../prism/prism.module';
import { ERC8004Module } from '../erc8004/erc8004.module';
import { RiskModule } from '../risk/risk.module';
import { HackathonModule } from '../hackathon/hackathon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentDecision, TradingCycleLog]),
    VerificationModule,
    QuantumModule,
    PolicyModule,
    KrakenModule,
    PrismModule,
    ERC8004Module,
    RiskModule,
    HackathonModule,
  ],
  controllers: [AgentController, AgentInstructController, AgentCronController],
  providers: [
    AgentService,
    GeminiService,
    GeminiTradingService,
    GeminiFunctionExecutorService,
    PerformanceService,
    TradingLoopService,
  ],
  exports: [
    AgentService,
    GeminiService,
    GeminiTradingService,
    GeminiFunctionExecutorService,
    PerformanceService,
    TradingLoopService,
  ],
})
export class AgentModule { }
