import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { Eip712TradeIntentSignerService } from './eip712-trade-intent.signer';
import { Eip712HackathonIntentSignerService } from './eip712-hackathon-intent.signer';

@Module({
  controllers: [RiskController],
  providers: [
    RiskService,
    Eip712TradeIntentSignerService,
    Eip712HackathonIntentSignerService,
  ],
  exports: [
    RiskService,
    Eip712TradeIntentSignerService,
    Eip712HackathonIntentSignerService,
  ],
})
export class RiskModule { }
