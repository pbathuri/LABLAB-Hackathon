import { ReliabilityService } from './reliability.service';
declare class RegisterProviderDto {
    name: string;
    endpoint: string;
    description?: string;
    costPerCall?: string;
}
export declare class ReliabilityController {
    private readonly reliabilityService;
    constructor(reliabilityService: ReliabilityService);
    registerProvider(dto: RegisterProviderDto): Promise<import("./entities/provider.entity").Provider>;
    getProviders(): Promise<import("./entities/provider.entity").Provider[]>;
    getBestProvider(): Promise<import("./entities/provider.entity").Provider | null>;
    getStats(): Promise<{
        totalProviders: number;
        activeProviders: number;
        blacklistedProviders: number;
        averageReliability: number;
    }>;
}
export {};
