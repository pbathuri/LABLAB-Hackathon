import { QuantumService } from './quantum.service';
import { QRNGService } from './services/qrng.service';
import { PostQuantumCryptoService } from './services/post-quantum-crypto.service';
declare class OptimizePortfolioDto {
    holdings?: Record<string, number>;
    riskTolerance?: number;
}
declare class SignMessageDto {
    message: string;
    secretKey: string;
}
export declare class QuantumController {
    private readonly quantumService;
    private readonly qrngService;
    private readonly postQuantumCrypto;
    constructor(quantumService: QuantumService, qrngService: QRNGService, postQuantumCrypto: PostQuantumCryptoService);
    optimizePortfolio(dto: OptimizePortfolioDto): Promise<import("./quantum.service").PortfolioOptimizationResult>;
    getRandomNumbers(): Promise<{
        randomNumbers: number[];
        nonce: string;
        quantumUUID: string;
        source: string;
    }>;
    generateKeyPair(): Promise<{
        publicKey: string;
        algorithm: string;
        warning: string;
    }>;
    signMessage(dto: SignMessageDto): Promise<import("./services/post-quantum-crypto.service").Signature>;
}
export {};
