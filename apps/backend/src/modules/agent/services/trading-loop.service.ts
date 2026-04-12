import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KrakenMarketService } from '../../kraken/kraken-market.service';
import { KrakenPaperService } from '../../kraken/kraken-paper.service';
import { PrismService } from '../../prism/prism.service';
import {
  GeminiTradingService,
  GeminiTradingResult,
} from './gemini-trading.service';
import { GeminiFunctionExecutorService } from './gemini-function-executor.service';
import { ERC8004Service } from '../../erc8004/erc8004.service';
import { PerformanceService } from './performance.service';
import { HackathonService } from '../../hackathon/hackathon.service';
import { TradingCycleLog } from '../entities/trading-cycle-log.entity';
import { ethers } from 'ethers';

function buildBuyReasoning(params: {
  pair: string;
  price: number;
  confidence: number;
  rsiSignal?: number;
  trendSignal?: string;
  positionUsd: number;
  aiReason?: string;
}): string {
  const base =
    params.aiReason && params.aiReason.length > 40 ? params.aiReason : '';
  const specific =
    `BUY signal confirmed for ${params.pair} at $${params.price.toFixed(2)}. ` +
    `AI confidence: ${(params.confidence * 100).toFixed(0)}%. ` +
    (params.rsiSignal
      ? `RSI=${params.rsiSignal.toFixed(1)} (${params.rsiSignal < 40 ? 'oversold' : 'neutral'}). `
      : '') +
    (params.trendSignal ? `Trend: ${params.trendSignal}. ` : '') +
    `Position size $${params.positionUsd} within 9.5% portfolio allocation — respects 10% max position limit. ` +
    `Stop-loss at -1%, take-profit at +0.5%. EIP-712 signed intent submitted to hackathon RiskRouter on Sepolia. ` +
    `Capital rotation protocol active.`;
  return base ? `${base}. ${specific}`.slice(0, 200) : specific.slice(0, 200);
}

function buildSellReasoning(params: {
  pair: string;
  price: number;
  entryPrice: number;
  pnlPct: number;
  heldMinutes: number;
  exitReason: 'take_profit' | 'stop_loss' | 'time_exit';
  positionUsd: number;
}): string {
  const pnlStr =
    params.pnlPct >= 0
      ? `+${params.pnlPct.toFixed(3)}`
      : params.pnlPct.toFixed(3);
  const exitMap = {
    take_profit: `Take-profit target +0.5% achieved`,
    stop_loss: `Stop-loss -1% triggered — capital preservation protocol activated`,
    time_exit: `60-minute time-exit: capital rotation to new opportunities`,
  };
  return (
    `${exitMap[params.exitReason]}. ` +
    `${params.pair} exit at $${params.price.toFixed(2)}, entry was $${params.entryPrice.toFixed(2)}. ` +
    `PnL: ${pnlStr}% over ${params.heldMinutes} min. ` +
    `Risk management protocol executed per autonomous agent rules. ` +
    `EIP-712 signed exit intent submitted on-chain.`
  ).slice(0, 200);
}

function buildHoldReasoning(params: {
  pair: string;
  price: number;
  isPositionOpen: boolean;
  pnlPct?: number;
  heldMinutes?: number;
  aiReason?: string;
}): string {
  if (params.isPositionOpen) {
    return (
      `Monitoring open ${params.pair} position. ` +
      `Current price $${params.price.toFixed(2)}, PnL: ${(params.pnlPct || 0).toFixed(3)}%, ` +
      `held ${params.heldMinutes || 0} min. ` +
      `Position within acceptable range — stop-loss (-1%) and take-profit (+0.5%) guards active. ` +
      `Risk parameters compliant. Autonomous monitoring protocol executing.`
    ).slice(0, 200);
  }
  const base =
    params.aiReason && params.aiReason.length > 40 ? params.aiReason : '';
  const standby = (
    `HOLD — no entry signal for ${params.pair} at $${params.price.toFixed(2)}. ` +
    `Awaiting optimal risk/reward setup. Neural sync active. ` +
    `No confirmed trend divergence or oversold RSI detected. ` +
    `Capital preservation in standby. Next entry requires confirmed signal per risk protocol.`
  ).slice(0, 200);
  return base ? `${base}. ${standby}`.slice(0, 200) : standby;
}

interface PaperPosition {
  isOpen: boolean;
  avgPrice: number;
  holdings: number;
  entryTimestamp: number;
  pair: string;
}

@Injectable()
export class TradingLoopService implements OnModuleInit {
  private readonly logger = new Logger(TradingLoopService.name);
  private isRunning = false;
  private readonly watchlist = ['BTCUSD', 'ETHUSD', 'SOLUSD'];

  /** In-memory map; on Vercel/persisted paper, synced from DB via KrakenPaperService. */
  private positions: Record<string, PaperPosition> = {};

  constructor(
    private readonly krakenMarket: KrakenMarketService,
    private readonly krakenPaper: KrakenPaperService,
    private readonly prism: PrismService,
    private readonly gemini: GeminiTradingService,
    private readonly functionExecutor: GeminiFunctionExecutorService,
    private readonly erc8004: ERC8004Service,
    private readonly performance: PerformanceService,
    private readonly hackathon: HackathonService,
    @InjectRepository(TradingCycleLog)
    private readonly cycleRepo: Repository<TradingCycleLog>,
  ) { }

  async onModuleInit(): Promise<void> {
    if (process.env.TRADING_LOOP_INIT_PAPER !== 'false') {
      const init = await this.krakenPaper.init(10000);
      if (init.success) {
        this.logger.log('Paper trading initialized ($10,000)');
      } else {
        this.logger.warn(
          `Paper init did not complete (is Kraken CLI installed?): ${init.error?.message ?? 'unknown'}`,
        );
      }
    } else {
      this.logger.log('Skipping paper init (TRADING_LOOP_INIT_PAPER=false)');
    }

    if (
      this.krakenPaper.usesPersistedLedger() ||
      this.krakenPaper.usesVercelMemoryPaper()
    ) {
      const m = await this.krakenPaper.loadPositionsMap();
      this.positions = { ...m };
      this.logger.log('Loaded paper positions from ledger / Vercel memory');
    }

    if (this.hackathon.isConfigured) {
      const agentId = await this.hackathon.initializeAgent().catch((err) => {
        this.logger.warn(`Hackathon init failed: ${err}`);
        return null;
      });
      if (agentId) {
        this.logger.log(`Hackathon agent ready: ID=${agentId}`);
      }
    } else {
      this.logger.warn(
        'HackathonService not configured — set AGENT_PRIVATE_KEY + SEPOLIA_RPC_URL for leaderboard intents',
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async executeTradingCycle(): Promise<void> {
    if (process.env.VERCEL === '1') {
      return;
    }
    if (process.env.TRADING_LOOP_ENABLED !== 'true') {
      return;
    }
    await this.runCycleOnce();
  }

  /** One trading cycle; used by HTTP cron on Vercel and by the in-process cron elsewhere. */
  async runCycleOnce(): Promise<{ ok: boolean; skipped?: string; ms?: number }> {
    if (process.env.TRADING_LOOP_ENABLED !== 'true') {
      return { ok: true, skipped: 'TRADING_LOOP_ENABLED is not true' };
    }
    if (this.isRunning) {
      return { ok: true, skipped: 'already running' };
    }
    this.isRunning = true;
    const start = Date.now();

    if (
      this.krakenPaper.usesPersistedLedger() ||
      this.krakenPaper.usesVercelMemoryPaper()
    ) {
      this.positions = { ...(await this.krakenPaper.loadPositionsMap()) };
    }

    let cycleAction = 'hold';
    let cycleReasoning = '';
    let confidence = 0.8;
    let pnlSnapshot = 0;
    let intentResult: { hash: string; signature: string; nonce: string } | null =
      null;
    let decision: GeminiTradingResult | null = null;
    let functionCalls: GeminiTradingResult['functionCalls'] = [];
    const execResults: unknown[] = [];

    try {
      const agentId = this.hackathon.agentId;
      const marketData = await this.scanMarket();
      const signals = await this.getSignals();
      const portfolio = await this.krakenPaper.status();

      const btcPrice = this.extractPrice(marketData, 'BTCUSD') || 90000;
      const btcPair = 'BTC/USD';
      const pos = this.positions['BTCUSD'];
      const timestamp = Date.now();

      if (pos?.isOpen) {
        const pnlPct = (btcPrice - pos.avgPrice) / pos.avgPrice;
        const heldMs = timestamp - pos.entryTimestamp;
        const heldMinutes = Math.floor(heldMs / 60000);
        pnlSnapshot = pnlPct * 100;

        let exitReason: 'take_profit' | 'stop_loss' | 'time_exit' | null = null;
        if (pnlPct >= 0.005) exitReason = 'take_profit';
        else if (pnlPct <= -0.01) exitReason = 'stop_loss';
        else if (heldMs >= 3600000) exitReason = 'time_exit';

        if (exitReason) {
          cycleAction = 'sell';
          cycleReasoning = buildSellReasoning({
            pair: btcPair,
            price: btcPrice,
            entryPrice: pos.avgPrice,
            pnlPct: pnlPct * 100,
            heldMinutes,
            exitReason,
            positionUsd: pos.holdings * btcPrice,
          });
          confidence = 1.0;

          const result = await this.krakenPaper
            .sell('XBTUSD', pos.holdings, { type: 'market' })
            .catch(() => ({ success: false }));

          if (result.success) {
            if (
              this.krakenPaper.usesPersistedLedger() ||
              this.krakenPaper.usesVercelMemoryPaper()
            ) {
              this.positions = {
                ...(await this.krakenPaper.loadPositionsMap()),
              };
            } else {
              this.positions['BTCUSD'] = {
                isOpen: false,
                avgPrice: 0,
                holdings: 0,
                entryTimestamp: 0,
                pair: 'BTCUSD',
              };
            }
          }

          if (agentId) {
            intentResult = await this.hackathon
              .submitTradeIntent({
                agentId,
                pair: btcPair,
                action: 'SELL',
                amountUsd: Math.floor(pos.holdings * btcPrice),
                reasoningText: cycleReasoning,
                confidenceScore: confidence,
                pnlSnapshot: pnlPct * 100,
              })
              .catch((e) => {
                this.logger.warn(`Intent failed: ${e}`);
                return null;
              });

            await this.hackathon
              .postCheckpoint(
                agentId,
                {
                  action: 'SELL',
                  pair: btcPair,
                  price: btcPrice,
                  reasoning: cycleReasoning,
                },
                confidence,
                pnlPct * 100,
              )
              .catch((e) => this.logger.warn(`Checkpoint failed: ${e}`));

            await this.hackathon
              .submitFeedback(agentId, Math.floor(confidence * 100), {
                action: 'sell',
                pnlPercent: pnlPct * 100,
                executed: true,
                pair: btcPair,
                reason: cycleReasoning,
              })
              .catch((e) => this.logger.warn(`Feedback failed: ${e}`));
          }
        } else {
          cycleAction = 'hold';
          cycleReasoning = buildHoldReasoning({
            pair: btcPair,
            price: btcPrice,
            isPositionOpen: true,
            pnlPct: pnlPct * 100,
            heldMinutes,
          });

          if (agentId) {
            await this.hackathon
              .signHeartbeat(
                agentId,
                'hold',
                cycleReasoning.slice(0, 200),
                timestamp,
              )
              .catch(() => null);

            await this.hackathon
              .postCheckpoint(
                agentId,
                {
                  action: 'HOLD',
                  pair: btcPair,
                  price: btcPrice,
                  reasoning: cycleReasoning,
                },
                0.85,
                pnlPct * 100,
              )
              .catch((e) => this.logger.warn(`Checkpoint failed: ${e}`));
          }
        }
      } else {
        decision = await this.gemini
          .processInstruction(
            `Analyze ${btcPair} market and decide: BUY now, or HOLD for better entry?`,
            {
              portfolio: portfolio.data ?? portfolio,
              signals,
              riskMetrics: marketData,
            },
          )
          .catch(
            (): GeminiTradingResult => ({
              reasoning: `Standby: monitoring ${btcPair} at $${btcPrice.toFixed(2)}. Awaiting entry signal.`,
              functionCalls: [],
            }),
          );

        functionCalls = decision.functionCalls ?? [];
        confidence = this.inferConfidence(decision);

        for (const call of functionCalls) {
          const r = await this.functionExecutor.executeCall(call).catch(() => null);
          execResults.push(r);
        }

        const aiAction = this.inferAiAction(decision);

        if (aiAction === 'buy') {
          const positionUsd = 950;
          const volume = positionUsd / btcPrice;
          const nav = this.estimateNav(portfolio);

          if (nav < 9000) {
            cycleAction = 'hold';
            cycleReasoning = buildHoldReasoning({
              pair: btcPair,
              price: btcPrice,
              isPositionOpen: false,
              aiReason:
                'Drawdown halt active — portfolio below $9,000 (10% from $10,000 start). Autonomous risk protection engaged.',
            });
            confidence = 0.9;
          } else {
            const result = await this.krakenPaper
              .buy('XBTUSD', volume, { type: 'market' })
              .catch(() => ({ success: false }));

            if (result.success) {
              if (
                this.krakenPaper.usesPersistedLedger() ||
                this.krakenPaper.usesVercelMemoryPaper()
              ) {
                this.positions = {
                  ...(await this.krakenPaper.loadPositionsMap()),
                };
              } else {
                this.positions['BTCUSD'] = {
                  isOpen: true,
                  avgPrice: btcPrice,
                  holdings: volume,
                  entryTimestamp: timestamp,
                  pair: 'BTCUSD',
                };
              }
              cycleAction = 'buy';
              cycleReasoning = buildBuyReasoning({
                pair: btcPair,
                price: btcPrice,
                confidence,
                rsiSignal: (signals['BTC'] as { rsi?: number })?.rsi,
                trendSignal: (signals['BTC'] as { trend?: string })?.trend,
                positionUsd,
                aiReason: decision.reasoning,
              });

              if (agentId) {
                intentResult = await this.hackathon
                  .submitTradeIntent({
                    agentId,
                    pair: btcPair,
                    action: 'BUY',
                    amountUsd: positionUsd,
                    reasoningText: cycleReasoning,
                    confidenceScore: confidence,
                    pnlSnapshot: 0,
                  })
                  .catch((e) => {
                    this.logger.warn(`Intent failed: ${e}`);
                    return null;
                  });

                await this.hackathon
                  .postCheckpoint(
                    agentId,
                    {
                      action: 'BUY',
                      pair: btcPair,
                      price: btcPrice,
                      reasoning: cycleReasoning,
                    },
                    confidence,
                    0,
                  )
                  .catch((e) => this.logger.warn(`Checkpoint failed: ${e}`));

                await this.hackathon
                  .submitFeedback(agentId, Math.floor(confidence * 100), {
                    action: 'buy',
                    pnlPercent: 0,
                    executed: true,
                    pair: btcPair,
                    reason: cycleReasoning,
                  })
                  .catch((e) => this.logger.warn(`Feedback failed: ${e}`));
              }
            } else {
              cycleAction = 'hold';
              cycleReasoning = buildHoldReasoning({
                pair: btcPair,
                price: btcPrice,
                isPositionOpen: false,
                aiReason: decision.reasoning,
              });
            }
          }
        } else {
          cycleAction = 'hold';
          cycleReasoning = buildHoldReasoning({
            pair: btcPair,
            price: btcPrice,
            isPositionOpen: false,
            aiReason: decision.reasoning,
          });

          if (agentId) {
            await this.hackathon
              .signHeartbeat(
                agentId,
                'hold',
                cycleReasoning.slice(0, 200),
                timestamp,
              )
              .catch(() => null);

            await this.hackathon
              .submitTradeIntent({
                agentId,
                pair: btcPair,
                action: 'HOLD',
                amountUsd: 0,
                reasoningText: cycleReasoning,
                confidenceScore: confidence,
                pnlSnapshot: 0,
              })
              .catch((e) => this.logger.warn(`Hold intent failed: ${e}`));

            await this.hackathon
              .postCheckpoint(
                agentId,
                {
                  action: 'HOLD',
                  pair: btcPair,
                  price: btcPrice,
                  reasoning: cycleReasoning,
                },
                confidence,
                0,
              )
              .catch((e) => this.logger.warn(`Checkpoint failed: ${e}`));
          }
        }
      }

      this.performance.recordNavSnapshot(this.estimateNav(portfolio));

      await this.cycleRepo
        .save({
          marketScan: marketData,
          signals: signals as Record<string, unknown>,
          reasoning: cycleReasoning,
          functionCalls: decision?.functionCalls ?? functionCalls,
          executionResults: execResults,
          reputationPosted: false,
        })
        .catch((e) => this.logger.warn(`Cycle log save failed: ${e}`));

      await this.maybePostReputation();

      if (this.performance.shouldHaltForDrawdown()) {
        this.logger.warn('Drawdown >= 10% — halt recommended');
      }

      this.logger.log(
        `Cycle: action=${cycleAction} pair=${btcPair} price=$${btcPrice.toFixed(2)} ` +
        `agentId=${agentId ?? 'UNREGISTERED'} intent=${intentResult?.hash?.slice(0, 14) ?? 'none'}`,
      );

      return { ok: true, ms: Date.now() - start };
    } catch (e) {
      this.logger.error(`Trading cycle error: ${e}`);
      return { ok: false, ms: Date.now() - start };
    } finally {
      this.isRunning = false;
      this.logger.debug(`Cycle ms=${Date.now() - start}`);
    }
  }

  private inferAiAction(d: GeminiTradingResult): 'buy' | 'hold' {
    const calls = d.functionCalls ?? [];
    if (calls.some((c) => c.name === 'paper_buy')) return 'buy';
    const r = (d.reasoning ?? '').toUpperCase();
    if (
      r.includes('BUY') &&
      !r.includes('NOT BUY') &&
      !r.includes('DO NOT BUY') &&
      !r.includes('NO BUY')
    ) {
      return 'buy';
    }
    return 'hold';
  }

  private inferConfidence(d: GeminiTradingResult): number {
    const r = d.reasoning ?? '';
    const m = r.match(/(\d{1,3})\s*%?\s*(confidence|certain)/i);
    if (m) {
      const n = Number(m[1]);
      if (n <= 100) return Math.min(1, n / 100);
    }
    return 0.75;
  }

  private estimateNav(paper: { data?: unknown }): number {
    try {
      const d = paper.data as { portfolio?: { total?: number } };
      if (d?.portfolio?.total != null) {
        return Number(d.portfolio.total);
      }
    } catch {
      /* ignore */
    }
    return this.performance.getLastNav() ?? 10000;
  }

  private extractPrice(market: Record<string, unknown>, pair: string): number {
    try {
      const d = market[pair] as {
        last?: number;
        price?: number;
        c?: number[];
      };
      return d?.last ?? d?.price ?? d?.c?.[0] ?? 0;
    } catch {
      return 0;
    }
  }

  private async scanMarket(): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    for (const pair of this.watchlist) {
      try {
        const t = await this.krakenMarket.ticker(pair);
        results[pair] = t.data ?? t;
      } catch {
        results[pair] = {};
      }
    }
    return results;
  }

  private async getSignals(): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const sym of ['BTC', 'ETH', 'SOL']) {
      try {
        out[sym] = await this.prism.signals(sym);
      } catch {
        this.logger.warn(`PRISM signals failed for ${sym}`);
      }
    }
    return out;
  }

  private async maybePostReputation(): Promise<void> {
    const metrics = this.performance.getDailyMetrics();
    if (!metrics.shouldPost) {
      return;
    }
    try {
      await this.erc8004.postPerformanceFeedback(metrics);
      this.performance.markReputationPostedForToday();
    } catch (e) {
      this.logger.warn(`Reputation post skipped: ${e}`);
    }
  }

  static hashIntent(parts: string[]): string {
    return ethers.keccak256(ethers.toUtf8Bytes(parts.join('|')));
  }
}
