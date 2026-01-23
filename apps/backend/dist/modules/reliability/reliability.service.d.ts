import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
export declare class ReliabilityService {
    private providerRepository;
    private readonly logger;
    private readonly GAMMA;
    private readonly BLACKLIST_THRESHOLD;
    constructor(providerRepository: Repository<Provider>);
    registerProvider(name: string, endpoint: string, description?: string, costPerCall?: string): Promise<Provider>;
    recordSuccess(providerId: string, latencyMs: number): Promise<void>;
    recordFailure(providerId: string): Promise<void>;
    getProvidersByReliability(excludeBlacklisted?: boolean): Promise<Provider[]>;
    selectBestProvider(): Promise<Provider | null>;
    private calculateReliabilityScore;
    getProviderStats(): Promise<{
        totalProviders: number;
        activeProviders: number;
        blacklistedProviders: number;
        averageReliability: number;
    }>;
}
