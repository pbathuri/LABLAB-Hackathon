export declare class QRNGService {
    private readonly logger;
    generateRandomNumbers(count: number): Promise<number[]>;
    generateRandomBits(count: number): Promise<number[]>;
    generateQuantumUUID(): Promise<string>;
    generateNonce(length?: number): Promise<string>;
}
