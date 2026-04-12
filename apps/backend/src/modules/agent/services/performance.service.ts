import { Injectable, Logger } from '@nestjs/common';

export interface DailyMetrics {
  pnlPercent: number;
  sharpeRatio: number;
  maxDrawdownBps: number;
  winRate: number;
  shouldPost: boolean;
}

/**
 * Tracks simplified performance for reputation posts and UI.
 * Sharpe uses mean/approx stdev of daily returns (placeholder when sample small).
 */
@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private peakNav = 10000;
  private lastNav = 10000;
  private returns: number[] = [];
  private lastReputationDayPosted = '';

  recordNavSnapshot(nav: number): void {
    if (nav > this.peakNav) {
      this.peakNav = nav;
    }
    const prev = this.lastNav;
    this.lastNav = nav;
    if (prev > 0) {
      this.returns.push((nav - prev) / prev);
    }
  }

  getSharpe(): number {
    if (this.returns.length < 2) {
      return 0;
    }
    const mean =
      this.returns.reduce((a, b) => a + b, 0) / this.returns.length;
    const variance =
      this.returns.reduce((s, r) => s + (r - mean) ** 2, 0) /
      (this.returns.length - 1);
    const std = Math.sqrt(variance) || 1e-9;
    return mean / std;
  }

  getMaxDrawdownBps(): number {
    if (this.peakNav <= 0) {
      return 0;
    }
    const dd = ((this.peakNav - this.lastNav) / this.peakNav) * 10000;
    return Math.max(0, Math.round(dd));
  }

  getLastNav(): number {
    return this.lastNav;
  }

  getDailyMetrics(): DailyMetrics {
    const today = new Date().toISOString().slice(0, 10);
    const shouldPost = this.lastReputationDayPosted !== today;
    const pnlPercent = ((this.lastNav - 10000) / 10000) * 100;
    return {
      pnlPercent,
      sharpeRatio: this.getSharpe(),
      maxDrawdownBps: this.getMaxDrawdownBps(),
      winRate: 50,
      shouldPost,
    };
  }

  markReputationPostedForToday(): void {
    this.lastReputationDayPosted = new Date().toISOString().slice(0, 10);
  }

  shouldHaltForDrawdown(): boolean {
    return this.getMaxDrawdownBps() >= 1000;
  }

  logMetrics(): void {
    this.logger.debug(
      `nav=${this.lastNav} peak=${this.peakNav} sharpe=${this.getSharpe().toFixed(3)}`,
    );
  }
}
