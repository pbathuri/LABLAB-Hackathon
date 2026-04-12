import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsNumber, IsObject, IsString } from 'class-validator';
import { QuantumService } from './quantum.service';
import { QRNGService } from './services/qrng.service';
import { PostQuantumCryptoService } from './services/post-quantum-crypto.service';

class OptimizePortfolioDto {
  @IsOptional()
  @IsObject()
  holdings?: Record<string, number>;

  @IsOptional()
  @IsNumber()
  riskTolerance?: number;
}

class SignMessageDto {
  @IsString()
  message: string;

  @IsString()
  secretKey: string;
}

@ApiTags('quantum')
@Controller('quantum')
export class QuantumController {
  constructor(
    private readonly quantumService: QuantumService,
    private readonly qrngService: QRNGService,
    private readonly postQuantumCrypto: PostQuantumCryptoService,
  ) { }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize portfolio using VQE algorithm (public)' })
  @ApiResponse({ status: 200, description: 'Optimization result' })
  async optimizePortfolio(@Body() dto: OptimizePortfolioDto) {
    return this.quantumService.optimizePortfolio(
      dto.holdings || { USDC: 600, ETH: 300, ARC: 100 },
      dto.riskTolerance || 0.5,
    );
  }

  @Get('random')
  @ApiOperation({ summary: 'Generate quantum random numbers (public)' })
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('sign')
  @ApiOperation({ summary: 'Sign message with post-quantum signature' })
  @ApiResponse({ status: 200, description: 'Signature generated' })
  async signMessage(@Body() dto: SignMessageDto) {
    const signature = await this.postQuantumCrypto.sign(
      dto.message,
      dto.secretKey,
    );
    return signature;
  }
}
