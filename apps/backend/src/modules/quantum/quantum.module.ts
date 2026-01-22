import { Module } from '@nestjs/common';
import { QuantumService } from './quantum.service';
import { QuantumController } from './quantum.controller';
import { QRNGService } from './services/qrng.service';
import { PostQuantumCryptoService } from './services/post-quantum-crypto.service';

@Module({
  controllers: [QuantumController],
  providers: [QuantumService, QRNGService, PostQuantumCryptoService],
  exports: [QuantumService, QRNGService, PostQuantumCryptoService],
})
export class QuantumModule {}
