import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';

/**
 * Reliability Scoring Service
 * 
 * Computes reliability scores for API/data providers:
 * 
 * R_p = γ · S_p + (1 - γ) · (1 / (1 + L_p))
 * 
 * where:
 * - S_p: Historical success rate of provider p (fraction of valid responses)
 * - L_p: Average latency of p (in seconds)
 * - γ ∈ [0,1]: Tunable weight (default 0.8)
 * 
 * Providers with R_p below threshold are blacklisted.
 */

@Injectable()
export class ReliabilityService {
  private readonly logger = new Logger(ReliabilityService.name);
  
  // Weighting factor for success rate vs latency
  private readonly GAMMA = 0.8;
  
  // Minimum reliability score before blacklisting
  private readonly BLACKLIST_THRESHOLD = 0.3;

  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  /**
   * Register a new provider
   */
  async registerProvider(
    name: string,
    endpoint: string,
    description?: string,
    costPerCall?: string,
  ): Promise<Provider> {
    const existing = await this.providerRepository.findOne({
      where: { endpoint },
    });

    if (existing) {
      return existing;
    }

    const provider = this.providerRepository.create({
      name,
      endpoint,
      description,
      costPerCall,
      successRate: '1',
      averageLatencyMs: '100',
      reliabilityScore: '1',
    });

    await this.providerRepository.save(provider);
    this.logger.log(`Registered provider: ${name}`);

    return provider;
  }

  /**
   * Record a successful call to a provider
   */
  async recordSuccess(providerId: string, latencyMs: number): Promise<void> {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      return;
    }

    provider.totalCalls += 1;
    provider.successfulCalls += 1;

    // Update success rate
    provider.successRate = (
      provider.successfulCalls / provider.totalCalls
    ).toFixed(4);

    // Update average latency (exponential moving average)
    const alpha = 0.1;
    const currentAvg = parseFloat(provider.averageLatencyMs);
    provider.averageLatencyMs = (
      alpha * latencyMs +
      (1 - alpha) * currentAvg
    ).toFixed(2);

    // Recalculate reliability score
    provider.reliabilityScore = this.calculateReliabilityScore(provider);

    // Check for blacklisting
    if (parseFloat(provider.reliabilityScore) < this.BLACKLIST_THRESHOLD) {
      provider.isBlacklisted = true;
      this.logger.warn(`Provider ${provider.name} blacklisted due to low reliability`);
    }

    await this.providerRepository.save(provider);
  }

  /**
   * Record a failed call to a provider
   */
  async recordFailure(providerId: string): Promise<void> {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      return;
    }

    provider.totalCalls += 1;

    // Update success rate
    provider.successRate = (
      provider.successfulCalls / provider.totalCalls
    ).toFixed(4);

    // Recalculate reliability score
    provider.reliabilityScore = this.calculateReliabilityScore(provider);

    // Check for blacklisting
    if (parseFloat(provider.reliabilityScore) < this.BLACKLIST_THRESHOLD) {
      provider.isBlacklisted = true;
      this.logger.warn(`Provider ${provider.name} blacklisted due to low reliability`);
    }

    await this.providerRepository.save(provider);
  }

  /**
   * Get providers sorted by reliability score
   */
  async getProvidersByReliability(
    excludeBlacklisted = true,
  ): Promise<Provider[]> {
    const query = this.providerRepository.createQueryBuilder('provider');

    if (excludeBlacklisted) {
      query.where('provider.isBlacklisted = :blacklisted', {
        blacklisted: false,
      });
    }

    return query
      .orderBy('provider.reliabilityScore', 'DESC')
      .getMany();
  }

  /**
   * Select the best provider for a request
   */
  async selectBestProvider(): Promise<Provider | null> {
    const providers = await this.getProvidersByReliability(true);
    return providers[0] || null;
  }

  /**
   * Calculate reliability score using formula:
   * R_p = γ · S_p + (1 - γ) · (1 / (1 + L_p))
   */
  private calculateReliabilityScore(provider: Provider): string {
    const successRate = parseFloat(provider.successRate);
    const latencySeconds = parseFloat(provider.averageLatencyMs) / 1000;

    const latencyComponent = 1 / (1 + latencySeconds);
    const score =
      this.GAMMA * successRate + (1 - this.GAMMA) * latencyComponent;

    return score.toFixed(4);
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(): Promise<{
    totalProviders: number;
    activeProviders: number;
    blacklistedProviders: number;
    averageReliability: number;
  }> {
    const providers = await this.providerRepository.find();

    const active = providers.filter((p) => !p.isBlacklisted);
    const blacklisted = providers.filter((p) => p.isBlacklisted);

    const avgReliability =
      providers.length > 0
        ? providers.reduce(
            (sum, p) => sum + parseFloat(p.reliabilityScore),
            0,
          ) / providers.length
        : 0;

    return {
      totalProviders: providers.length,
      activeProviders: active.length,
      blacklistedProviders: blacklisted.length,
      averageReliability: Math.round(avgReliability * 10000) / 10000,
    };
  }
}
