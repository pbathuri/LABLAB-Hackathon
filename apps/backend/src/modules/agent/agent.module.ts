import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { GeminiService } from './services/gemini.service';
import { AgentDecision } from './entities/agent-decision.entity';
import { VerificationModule } from '../verification/verification.module';
import { QuantumModule } from '../quantum/quantum.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentDecision]),
    VerificationModule,
    QuantumModule,
    PolicyModule,
  ],
  controllers: [AgentController],
  providers: [AgentService, GeminiService],
  exports: [AgentService, GeminiService],
})
export class AgentModule {}
