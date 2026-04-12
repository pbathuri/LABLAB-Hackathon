import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TradingLoopService } from './services/trading-loop.service';

/**
 * HTTP-triggered jobs for serverless (e.g. Vercel Cron).
 * Vercel sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET is set in project env.
 */
@Controller('agent/cron')
export class AgentCronController {
  private readonly logger = new Logger(AgentCronController.name);

  constructor(private readonly tradingLoop: TradingLoopService) { }

  /** Vercel Cron uses GET; allow POST for manual triggers. */
  @All('trading-tick')
  async tradingTick(@Req() req: Request, @Res() res: Response) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return res.status(503).json({ error: 'CRON_SECRET is not configured' });
    }
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await this.tradingLoop.runCycleOnce();
    this.logger.log(`trading-tick: ${JSON.stringify(result)}`);
    return res.status(result.ok ? 200 : 500).json(result);
  }
}
