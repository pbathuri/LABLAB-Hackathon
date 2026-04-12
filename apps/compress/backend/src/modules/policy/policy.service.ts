import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyConfig } from './entities/policy-config.entity';

/**
 * Policy Enforcement Service
 * 
 * Implements deterministic policy rules for agent decisions:
 * 1. Per-Transaction Limit: Each trade ≤ L_tx USDC (e.g., 50 USDC)
 * 2. Daily Cap: Cumulative total ≤ L_day in 24-hour window
 * 3. Cooldown Period: Minimum t_cooldown between successive trades
 * 4. Allowlist: Only approved counterparty addresses
 * 5. Price Deviation Guard: Proposed price within ±δ% of median
 */

export interface PolicyValidationResult {
  valid: boolean;
  reason?: string;
  checks: Array<{
    name: string;
    passed: boolean;
    message?: string;
  }>;
}

export interface DecisionForValidation {
  type: string;
  parameters: {
    amount?: number;
    quantity?: number;
    targetAddress?: string;
    price?: number;
  };
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(PolicyConfig)
    private policyRepository: Repository<PolicyConfig>,
  ) {}

  /**
   * Get or create policy config for user
   */
  async getPolicyConfig(userId: string): Promise<PolicyConfig> {
    let config = await this.policyRepository.findOne({
      where: { userId },
    });

    if (!config) {
      config = this.policyRepository.create({
        userId,
        maxTransactionAmount: '50',
        dailySpendingCap: '500',
        currentDailySpend: '0',
        cooldownPeriodSeconds: 60,
        maxPriceDeviationPercent: '5',
        allowedAddresses: [],
        riskTolerance: '0.5',
      });
      await this.policyRepository.save(config);
    }

    // Reset daily spend if new day
    await this.resetDailySpendIfNeeded(config);

    return config;
  }

  /**
   * Update policy configuration
   */
  async updatePolicyConfig(
    userId: string,
    updates: Partial<PolicyConfig>,
  ): Promise<PolicyConfig> {
    let config = await this.getPolicyConfig(userId);

    // Apply updates
    Object.assign(config, updates);
    await this.policyRepository.save(config);

    this.logger.log(`Updated policy config for user ${userId}`);
    return config;
  }

  /**
   * Validate a decision against policy rules
   */
  async validateDecision(
    userId: string,
    decision: DecisionForValidation,
  ): Promise<PolicyValidationResult> {
    const config = await this.getPolicyConfig(userId);
    const checks: Array<{ name: string; passed: boolean; message?: string }> = [];

    // 1. Per-Transaction Limit Check
    const amount = decision.parameters.amount || decision.parameters.quantity || 0;
    const maxTx = parseFloat(config.maxTransactionAmount);
    const txLimitCheck = amount <= maxTx;
    checks.push({
      name: 'per_transaction_limit',
      passed: txLimitCheck,
      message: txLimitCheck
        ? undefined
        : `Amount ${amount} exceeds limit ${maxTx} USDC`,
    });

    // 2. Daily Cap Check
    const currentSpend = parseFloat(config.currentDailySpend);
    const dailyCap = parseFloat(config.dailySpendingCap);
    const newTotal = currentSpend + amount;
    const dailyCapCheck = newTotal <= dailyCap;
    checks.push({
      name: 'daily_spending_cap',
      passed: dailyCapCheck,
      message: dailyCapCheck
        ? undefined
        : `Daily spend ${newTotal} would exceed cap ${dailyCap} USDC`,
    });

    // 3. Cooldown Period Check
    const cooldownCheck = this.checkCooldown(config);
    checks.push({
      name: 'cooldown_period',
      passed: cooldownCheck.passed,
      message: cooldownCheck.message,
    });

    // 4. Allowlist Check (if address provided)
    if (decision.parameters.targetAddress) {
      const allowlistCheck = this.checkAllowlist(
        config,
        decision.parameters.targetAddress,
      );
      checks.push({
        name: 'allowlist',
        passed: allowlistCheck.passed,
        message: allowlistCheck.message,
      });
    }

    // 5. Price Deviation Check (if price provided)
    if (decision.parameters.price) {
      const priceCheck = this.checkPriceDeviation(
        config,
        decision.parameters.price,
      );
      checks.push({
        name: 'price_deviation',
        passed: priceCheck.passed,
        message: priceCheck.message,
      });
    }

    const allPassed = checks.every((c) => c.passed);
    const failedChecks = checks.filter((c) => !c.passed);

    return {
      valid: allPassed,
      reason: allPassed
        ? undefined
        : failedChecks.map((c) => c.message).join('; '),
      checks,
    };
  }

  /**
   * Record a completed transaction (update daily spend)
   */
  async recordTransaction(userId: string, amount: number): Promise<void> {
    const config = await this.getPolicyConfig(userId);

    config.currentDailySpend = (
      parseFloat(config.currentDailySpend) + amount
    ).toString();
    config.lastTradeTimestamp = new Date();

    await this.policyRepository.save(config);
  }

  private checkCooldown(config: PolicyConfig): {
    passed: boolean;
    message?: string;
  } {
    if (!config.lastTradeTimestamp) {
      return { passed: true };
    }

    const lastTrade = new Date(config.lastTradeTimestamp).getTime();
    const now = Date.now();
    const elapsed = (now - lastTrade) / 1000;

    if (elapsed < config.cooldownPeriodSeconds) {
      const remaining = Math.ceil(config.cooldownPeriodSeconds - elapsed);
      return {
        passed: false,
        message: `Cooldown active: ${remaining}s remaining`,
      };
    }

    return { passed: true };
  }

  private checkAllowlist(
    config: PolicyConfig,
    address: string,
  ): { passed: boolean; message?: string } {
    // If allowlist is empty, all addresses are allowed
    if (config.allowedAddresses.length === 0) {
      return { passed: true };
    }

    const isAllowed = config.allowedAddresses.some(
      (a) => a.toLowerCase() === address.toLowerCase(),
    );

    return {
      passed: isAllowed,
      message: isAllowed ? undefined : `Address ${address} not in allowlist`,
    };
  }

  private checkPriceDeviation(
    config: PolicyConfig,
    proposedPrice: number,
  ): { passed: boolean; message?: string } {
    // In production, fetch actual median price from oracle
    const medianPrice = 1.0; // Mock: 1 USDC = 1 USD
    const maxDeviation = parseFloat(config.maxPriceDeviationPercent) / 100;

    const deviation = Math.abs(proposedPrice - medianPrice) / medianPrice;

    if (deviation > maxDeviation) {
      return {
        passed: false,
        message: `Price deviation ${(deviation * 100).toFixed(2)}% exceeds max ${config.maxPriceDeviationPercent}%`,
      };
    }

    return { passed: true };
  }

  private async resetDailySpendIfNeeded(config: PolicyConfig): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = config.lastSpendResetDate
      ? new Date(config.lastSpendResetDate)
      : null;

    if (!lastReset || lastReset < today) {
      config.currentDailySpend = '0';
      config.lastSpendResetDate = today;
      await this.policyRepository.save(config);
      this.logger.log(`Reset daily spend for user ${config.userId}`);
    }
  }
}
