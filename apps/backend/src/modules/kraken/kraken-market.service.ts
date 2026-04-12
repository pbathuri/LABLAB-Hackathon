import { Injectable, Logger } from '@nestjs/common';
import { KrakenCliService, KrakenResult } from './kraken-cli.service';
import { krakenPublicTicker } from './kraken-public.api';

@Injectable()
export class KrakenMarketService {
  private readonly logger = new Logger(KrakenMarketService.name);

  constructor(private readonly cli: KrakenCliService) { }

  private usePublicRest(): boolean {
    return (
      process.env.VERCEL === '1' || process.env.KRAKEN_USE_REST === 'true'
    );
  }

  /** Official CLI: `kraken ticker BTCUSD` (no `market` prefix). On Vercel uses public REST. */
  async ticker(pair: string): Promise<KrakenResult> {
    if (this.usePublicRest()) {
      try {
        const { last } = await krakenPublicTicker(pair);
        return {
          success: true,
          data: { last, c: [String(last), '0'] },
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Kraken REST ticker failed: ${message}`);
        return {
          success: false,
          error: { category: 'network', message },
        };
      }
    }
    return this.cli.execute(['ticker', pair]);
  }

  async ohlc(pair: string, interval = 60): Promise<KrakenResult> {
    return this.cli.execute(['ohlc', pair, '--interval', String(interval)]);
  }

  async orderbook(pair: string, count = 25): Promise<KrakenResult> {
    return this.cli.execute(['orderbook', pair, '--count', String(count)]);
  }

  async pairs(): Promise<KrakenResult> {
    return this.cli.execute(['pairs']);
  }

  async trades(pair: string, count = 25): Promise<KrakenResult> {
    return this.cli.execute(['trades', pair, '--count', String(count)]);
  }
}
