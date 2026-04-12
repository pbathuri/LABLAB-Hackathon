import { Injectable, Logger } from '@nestjs/common';

/**
 * Aerodrome DEX integration placeholder — swap paths depend on live pools on Base.
 * For Base Sepolia, liquidity may be absent; use mock tokens + RiskRouter for demos.
 */
@Injectable()
export class AerodromeService {
  private readonly logger = new Logger(AerodromeService.name);

  getRouterAddress(): string {
    return process.env.AERODROME_ROUTER ?? '';
  }

  /** Reserved for router.swapExactTokensForTokens calldata */
  async quoteSwap(): Promise<{ note: string }> {
    this.logger.debug('quoteSwap: not executed on testnet without pool liquidity');
    return { note: 'Use Kraken paper or deploy pool + mock liquidity for DEX demo' };
  }
}
