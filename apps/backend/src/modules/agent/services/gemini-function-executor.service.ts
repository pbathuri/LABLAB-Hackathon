import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { isValidHexPrivateKey } from '../../../common/eth-key.util';
import { KrakenPaperService } from '../../kraken/kraken-paper.service';
import { PrismService } from '../../prism/prism.service';
import {
  RiskService,
  TradeIntentStruct,
} from '../../risk/risk.service';
import { Eip712TradeIntentSignerService } from '../../risk/eip712-trade-intent.signer';
import { PerformanceService } from './performance.service';

/** Executes Gemini tool calls (paper trades, PRISM, portfolio) — shared by instruct + trading loop. */
@Injectable()
export class GeminiFunctionExecutorService {
  private readonly logger = new Logger(GeminiFunctionExecutorService.name);

  constructor(
    private readonly krakenPaper: KrakenPaperService,
    private readonly prism: PrismService,
    private readonly riskService: RiskService,
    private readonly eip712: Eip712TradeIntentSignerService,
    private readonly performance: PerformanceService,
  ) { }

  async executeCall(call: {
    name: string;
    args: Record<string, unknown>;
  }): Promise<unknown> {
    if (call.name === 'paper_buy' || call.name === 'paper_sell') {
      return this.executePaperTrade(call);
    }
    switch (call.name) {
      case 'portfolio_status':
        return this.krakenPaper.status();
      case 'check_risk':
        return this.prism.risk(String(call.args.symbol));
      case 'get_signals':
        return this.prism.signals(String(call.args.symbol));
      default:
        this.logger.warn(`Unknown function call: ${call.name}`);
        return null;
    }
  }

  private async executePaperTrade(call: {
    name: string;
    args: Record<string, unknown>;
  }): Promise<unknown> {
    const pk = process.env.AGENT_PRIVATE_KEY;
    const agent =
      pk && isValidHexPrivateKey(pk)
        ? new ethers.Wallet(pk.trim()).address
        : '';
    const usdc = process.env.MOCK_USDC_ADDRESS ?? ethers.ZeroAddress;
    const weth = process.env.MOCK_WETH_ADDRESS ?? ethers.ZeroAddress;
    const nav = BigInt(
      Math.floor(Math.max(this.performance.getLastNav(), 1) * 1e6),
    );
    const amountIn = BigInt(
      Math.floor(Number(call.args.volume) * 1e6) || 1,
    );
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
    const intent: TradeIntentStruct = {
      agent,
      tokenIn: usdc,
      tokenOut: weth,
      amountIn,
      minAmountOut: 1n,
      deadline,
      strategyHash: ethers.ZeroHash,
      portfolioNav: nav,
    };

    const check = await this.riskService.validateIntent(intent);
    if (!check.valid) {
      this.logger.warn(`RiskRouter: ${check.reason}`);
      return { skipped: true, reason: check.reason };
    }

    const hackCheck = await this.riskService.validateHackathonIntent(intent);
    if (!hackCheck.valid) {
      this.logger.warn(`Hackathon RiskRouter: ${hackCheck.reason}`);
      return { skipped: true, reason: `hackathon: ${hackCheck.reason}` };
    }

    if (this.eip712.isEnabled()) {
      await this.eip712.signTradeIntent({
        tokenIn: usdc,
        tokenOut: weth,
        amountIn,
        minAmountOut: 1n,
        deadline,
        strategyHash: ethers.ZeroHash,
        portfolioNav: nav,
      });
    }

    const intentHash = this.riskService.hashTradeIntent(intent);
    let result: Awaited<ReturnType<KrakenPaperService['buy']>>;
    if (call.name === 'paper_buy') {
      result = await this.krakenPaper.buy(
        String(call.args.pair),
        Number(call.args.volume),
        {
          type: (call.args.orderType as 'market' | 'limit') ?? 'market',
          price:
            call.args.price != null ? Number(call.args.price) : undefined,
        },
      );
    } else {
      result = await this.krakenPaper.sell(
        String(call.args.pair),
        Number(call.args.volume),
        {
          type: (call.args.orderType as 'market' | 'limit') ?? 'market',
          price:
            call.args.price != null ? Number(call.args.price) : undefined,
        },
      );
    }

    if (result.success && this.riskService.isHackathonRouterConfigured()) {
      const navAfter = BigInt(
        Math.floor(Math.max(this.performance.getLastNav(), 1) * 1e6),
      );
      await this.riskService.recordHackathonTradeExecution(
        agent,
        amountIn,
        amountIn,
        intentHash,
        navAfter,
      );
    }

    return result;
  }
}
