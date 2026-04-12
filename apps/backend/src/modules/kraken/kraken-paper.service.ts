import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KrakenCliService, KrakenResult } from './kraken-cli.service';
import { PaperPortfolioState } from './entities/paper-portfolio-state.entity';
import { krakenPublicTicker } from './kraken-public.api';

export type PaperOrderType = 'market' | 'limit';

/** Aligns with TradingLoopService in-memory position shape (key BTCUSD). */
export interface PaperPositionState {
  isOpen: boolean;
  avgPrice: number;
  holdings: number;
  entryTimestamp: number;
  pair: string;
}

const DEFAULT_BTC: PaperPositionState = {
  isOpen: false,
  avgPrice: 0,
  holdings: 0,
  entryTimestamp: 0,
  pair: 'BTCUSD',
};

/** Process-local paper ledger when Vercel has no hosted Postgres (cold starts reset). */
let vercelMemoryLedger: {
  cashUsd: number;
  positions: Record<string, PaperPositionState>;
} | null = null;

type MutableLedger = {
  cashUsd: number;
  positions: Record<string, PaperPositionState>;
};

@Injectable()
export class KrakenPaperService {
  constructor(
    private readonly cli: KrakenCliService,
    @Optional()
    @InjectRepository(PaperPortfolioState)
    private readonly paperState?: Repository<PaperPortfolioState>,
  ) {}

  /** USE_POSTGRES=true and a real DATABASE_URL (for hosted deploys). */
  hostedPostgresConfigured(): boolean {
    const url = process.env.DATABASE_URL?.trim();
    return (
      process.env.USE_POSTGRES === 'true' &&
      !!url &&
      url !== 'demo'
    );
  }

  /** Postgres row-backed ledger (Vercel + Neon/Supabase or PAPER_PORTFOLIO_PERSIST). */
  usesPersistedLedger(): boolean {
    if (!this.paperState) return false;
    if (process.env.PAPER_PORTFOLIO_PERSIST === 'true') return true;
    if (process.env.VERCEL === '1' && this.hostedPostgresConfigured()) return true;
    return false;
  }

  /** Vercel serverless without DB: in-process memory only (CLI unavailable). */
  usesVercelMemoryPaper(): boolean {
    return process.env.VERCEL === '1' && !this.hostedPostgresConfigured();
  }

  private positionKeyForPair(pair: string): string {
    const p = pair.toUpperCase();
    if (p === 'XBTUSD' || p === 'BTCUSD') return 'BTCUSD';
    return p.replace(/^XBT/, 'BTC');
  }

  private ensureVercelMemory(): MutableLedger {
    if (!vercelMemoryLedger) {
      vercelMemoryLedger = {
        cashUsd: 10000,
        positions: { BTCUSD: { ...DEFAULT_BTC } },
      };
    }
    return vercelMemoryLedger;
  }

  async loadPositionsMap(): Promise<Record<string, PaperPositionState>> {
    if (this.usesVercelMemoryPaper()) {
      const m = this.ensureVercelMemory();
      return {
        BTCUSD: { ...DEFAULT_BTC, ...m.positions.BTCUSD },
      };
    }
    if (!this.usesPersistedLedger() || !this.paperState) {
      return { BTCUSD: { ...DEFAULT_BTC } };
    }
    const row = await this.paperState.findOne({ where: { id: 'singleton' } });
    if (!row?.positionsJson) {
      return { BTCUSD: { ...DEFAULT_BTC } };
    }
    try {
      const parsed = JSON.parse(row.positionsJson) as Record<
        string,
        PaperPositionState
      >;
      return { BTCUSD: { ...DEFAULT_BTC, ...parsed.BTCUSD } };
    } catch {
      return { BTCUSD: { ...DEFAULT_BTC } };
    }
  }

  async init(balance = 10000): Promise<KrakenResult> {
    if (this.usesVercelMemoryPaper()) {
      vercelMemoryLedger = {
        cashUsd: balance,
        positions: { BTCUSD: { ...DEFAULT_BTC } },
      };
      return { success: true, data: { mode: 'vercel-memory', balance } };
    }
    if (this.usesPersistedLedger() && this.paperState) {
      const existing = await this.paperState.findOne({
        where: { id: 'singleton' },
      });
      if (existing && process.env.PAPER_RESET_ON_INIT !== 'true') {
        return {
          success: true,
          data: { mode: 'persisted', message: 'Paper ledger already seeded' },
        };
      }
      await this.paperState.save({
        id: 'singleton',
        cashUsd: balance,
        positionsJson: JSON.stringify({ BTCUSD: { ...DEFAULT_BTC } }),
      });
      return { success: true, data: { mode: 'persisted', balance } };
    }
    return this.cli.execute(['paper', 'init', '--balance', String(balance)]);
  }

  async buy(
    pair: string,
    volume: number,
    opts?: { type?: PaperOrderType; price?: number },
  ): Promise<KrakenResult> {
    if (this.usesVercelMemoryPaper()) {
      return this.memoryBuySell(pair, volume, 'buy', opts);
    }
    if (this.usesPersistedLedger() && this.paperState) {
      return this.persistedBuySell(pair, volume, 'buy', opts);
    }
    const args = ['paper', 'buy', pair, String(volume)];
    if (opts?.type === 'limit' && opts?.price != null) {
      args.push('--type', 'limit', '--price', String(opts.price));
    }
    return this.cli.execute(args);
  }

  async sell(
    pair: string,
    volume: number,
    opts?: { type?: PaperOrderType; price?: number },
  ): Promise<KrakenResult> {
    if (this.usesVercelMemoryPaper()) {
      return this.memoryBuySell(pair, volume, 'sell', opts);
    }
    if (this.usesPersistedLedger() && this.paperState) {
      return this.persistedBuySell(pair, volume, 'sell', opts);
    }
    const args = ['paper', 'sell', pair, String(volume)];
    if (opts?.type === 'limit' && opts?.price != null) {
      args.push('--type', 'limit', '--price', String(opts.price));
    }
    return this.cli.execute(args);
  }

  private async resolvePrice(
    pair: string,
    key: string,
    opts?: { type?: PaperOrderType; price?: number },
  ): Promise<{ ok: true; price: number } | { ok: false; message: string }> {
    try {
      if (opts?.type === 'limit' && opts.price != null) {
        return { ok: true, price: opts.price };
      }
      const t = await krakenPublicTicker(key === 'BTCUSD' ? 'BTCUSD' : pair);
      return { ok: true, price: t.last };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { ok: false, message };
    }
  }

  private applySide(
    ledger: MutableLedger,
    key: string,
    volume: number,
    side: 'buy' | 'sell',
    price: number,
  ): KrakenResult {
    const pos = { ...DEFAULT_BTC, ...ledger.positions[key] };

    if (side === 'buy') {
      const cost = volume * price;
      if (ledger.cashUsd < cost) {
        return {
          success: false,
          error: {
            category: 'funds',
            message: `Insufficient cash: need ${cost}, have ${ledger.cashUsd}`,
          },
        };
      }
      ledger.cashUsd -= cost;
      const newHoldings = pos.holdings + volume;
      const newAvg =
        newHoldings > 0
          ? (pos.avgPrice * pos.holdings + price * volume) / newHoldings
          : price;
      ledger.positions[key] = {
        isOpen: true,
        avgPrice: newAvg,
        holdings: newHoldings,
        entryTimestamp: pos.holdings > 0 ? pos.entryTimestamp : Date.now(),
        pair: key,
      };
    } else {
      if (volume > pos.holdings + 1e-12) {
        return {
          success: false,
          error: { category: 'position', message: 'Sell volume exceeds holdings' },
        };
      }
      const proceeds = volume * price;
      ledger.cashUsd += proceeds;
      const newHoldings = pos.holdings - volume;
      ledger.positions[key] = {
        isOpen: newHoldings > 1e-12,
        avgPrice: newHoldings > 1e-12 ? pos.avgPrice : 0,
        holdings: newHoldings,
        entryTimestamp: newHoldings > 1e-12 ? pos.entryTimestamp : 0,
        pair: key,
      };
    }
    return { success: true, data: { side, pair: key, volume, price } };
  }

  private async memoryBuySell(
    pair: string,
    volume: number,
    side: 'buy' | 'sell',
    opts?: { type?: PaperOrderType; price?: number },
  ): Promise<KrakenResult> {
    const key = this.positionKeyForPair(pair);
    const px = await this.resolvePrice(pair, key, opts);
    if (!px.ok) {
      return { success: false, error: { category: 'price', message: px.message } };
    }
    const ledger = this.ensureVercelMemory();
    return this.applySide(ledger, key, volume, side, px.price);
  }

  private async persistedBuySell(
    pair: string,
    volume: number,
    side: 'buy' | 'sell',
    opts?: { type?: PaperOrderType; price?: number },
  ): Promise<KrakenResult> {
    const key = this.positionKeyForPair(pair);
    const px = await this.resolvePrice(pair, key, opts);
    if (!px.ok) {
      return { success: false, error: { category: 'price', message: px.message } };
    }

    const row = await this.paperState!.findOne({ where: { id: 'singleton' } });
    if (!row) {
      return {
        success: false,
        error: { category: 'state', message: 'Paper ledger not initialized' },
      };
    }
    let positions: Record<string, PaperPositionState>;
    try {
      positions = JSON.parse(row.positionsJson || '{}') as Record<
        string,
        PaperPositionState
      >;
    } catch {
      positions = {};
    }
    const ledger: MutableLedger = { cashUsd: row.cashUsd, positions };
    const out = this.applySide(ledger, key, volume, side, px.price);
    if (!out.success) return out;
    row.cashUsd = ledger.cashUsd;
    row.positionsJson = JSON.stringify(ledger.positions);
    await this.paperState!.save(row);
    return out;
  }

  async status(): Promise<KrakenResult> {
    if (this.usesVercelMemoryPaper()) {
      const row = this.ensureVercelMemory();
      let mark = 90000;
      try {
        const { last } = await krakenPublicTicker('BTCUSD');
        mark = last;
      } catch {
        /* fallback */
      }
      const btc = { ...DEFAULT_BTC, ...row.positions.BTCUSD };
      const nav = row.cashUsd + btc.holdings * mark;
      return {
        success: true,
        data: {
          portfolio: { total: nav, cashUsd: row.cashUsd, markPriceBtc: mark },
          positions: row.positions,
        },
      };
    }
    if (this.usesPersistedLedger() && this.paperState) {
      const row = await this.paperState.findOne({
        where: { id: 'singleton' },
      });
      if (!row) {
        return {
          success: false,
          error: { category: 'state', message: 'Paper ledger not initialized' },
        };
      }
      let mark = 90000;
      try {
        const { last } = await krakenPublicTicker('BTCUSD');
        mark = last;
      } catch {
        /* fallback */
      }
      let positions: Record<string, PaperPositionState> = {};
      try {
        positions = JSON.parse(row.positionsJson || '{}') as Record<
          string,
          PaperPositionState
        >;
      } catch {
        positions = {};
      }
      const btc = { ...DEFAULT_BTC, ...positions.BTCUSD };
      const nav = row.cashUsd + btc.holdings * mark;
      return {
        success: true,
        data: {
          portfolio: { total: nav, cashUsd: row.cashUsd, markPriceBtc: mark },
          positions,
        },
      };
    }
    return this.cli.execute(['paper', 'status']);
  }

  async history(): Promise<KrakenResult> {
    if (this.usesPersistedLedger() || this.usesVercelMemoryPaper()) {
      return { success: true, data: { trades: [] } };
    }
    return this.cli.execute(['paper', 'history']);
  }

  async orders(): Promise<KrakenResult> {
    if (this.usesPersistedLedger() || this.usesVercelMemoryPaper()) {
      return { success: true, data: { open: [] } };
    }
    return this.cli.execute(['paper', 'orders']);
  }

  async cancel(orderId: string): Promise<KrakenResult> {
    if (this.usesPersistedLedger() || this.usesVercelMemoryPaper()) {
      return {
        success: false,
        error: { category: 'unsupported', message: 'No open orders in REST mode' },
      };
    }
    return this.cli.execute(['paper', 'cancel', orderId]);
  }

  async reset(): Promise<KrakenResult> {
    if (this.usesVercelMemoryPaper()) {
      vercelMemoryLedger = {
        cashUsd: 10000,
        positions: { BTCUSD: { ...DEFAULT_BTC } },
      };
      return { success: true, data: { reset: true } };
    }
    if (this.usesPersistedLedger() && this.paperState) {
      await this.paperState.save({
        id: 'singleton',
        cashUsd: 10000,
        positionsJson: JSON.stringify({ BTCUSD: { ...DEFAULT_BTC } }),
      });
      return { success: true, data: { reset: true } };
    }
    return this.cli.execute(['paper', 'reset']);
  }
}
