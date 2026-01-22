import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuantumService } from './quantum.service';
import { QRNGService } from './services/qrng.service';
import { PostQuantumCryptoService } from './services/post-quantum-crypto.service';

class OptimizePortfolioDto {
  holdings: Record<string, number>;
  riskTolerance?: number;
}

@ApiTags('quantum')
@Controller('quantum')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class QuantumController {
  constructor(
    private readonly quantumService: QuantumService,
    private readonly qrngService: QRNGService,
    private readonly postQuantumCrypto: PostQuantumCryptoService,
  ) {}

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize portfolio using VQE algorithm' })
  @ApiResponse({ status: 200, description: 'Optimization result' })
  async optimizePortfolio(@Body() dto: OptimizePortfolioDto) {
    return this.quantumService.optimizePortfolio(
      dto.holdings,
      dto.riskTolerance || 0.5,
    );
  }

  @Get('random')
  @ApiOperation({ summary: 'Generate quantum random numbers' })
  @ApiResponse({ status: 200, description: 'Random numbers generated' })
  async getRandomNumbers() {
    const numbers = await this.qrngService.generateRandomNumbers(10);
    const nonce = await this.qrngService.generateNonce(32);
    const uuid = await this.qrngService.generateQuantumUUID();

    return {
      randomNumbers: numbers,
      nonce,
      quantumUUID: uuid,
      source: 'QRNG Simulation',
    };
  }

  @Post('keypair')
  @ApiOperation({ summary: 'Generate post-quantum key pair' })
  @ApiResponse({ status: 201, description: 'Key pair generated' })
  async generateKeyPair() {
    const keyPair = await this.postQuantumCrypto.generateKeyPair();
    return {
      publicKey: keyPair.publicKey,
      algorithm: 'CRYSTALS-Dilithium (simulated)',
      warning: 'This is a simulation. Do not use for production cryptography.',
    };
  }

  @Post('sign')
  @ApiOperation({ summary: 'Sign message with post-quantum signature' })
  @ApiResponse({ status: 200, description: 'Signature generated' })
  async signMessage(@Body() body: { message: string; secretKey: string }) {
    const signature = await this.postQuantumCrypto.sign(
      body.message,
      body.secretKey,
    );
    return signature;
  }
}
