import { QRNGService } from './qrng.service';
export interface KeyPair {
    publicKey: string;
    secretKey: string;
}
export interface Signature {
    signature: string;
    algorithm: string;
    timestamp: string;
}
export declare class PostQuantumCryptoService {
    private qrngService;
    private readonly logger;
    private readonly ALGORITHM;
    constructor(qrngService: QRNGService);
    generateKeyPair(): Promise<KeyPair>;
    sign(message: string, secretKey: string): Promise<Signature>;
    verify(message: string, signature: Signature, publicKey: string): Promise<boolean>;
    signTypedData(typedData: {
        domain: Record<string, any>;
        types: Record<string, any>;
        message: Record<string, any>;
    }, secretKey: string): Promise<Signature>;
}
