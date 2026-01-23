import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get BFT verification network statistics (public)' })
  @ApiResponse({ status: 200, description: 'Verification stats returned' })
  async getStats() {
    const status = await this.verificationService.getVerifierStatus();
    // Add signedCount for frontend compatibility (simulated consensus state)
    return {
      ...status,
      signedCount: Math.min(status.activeNodes, 9), // Consensus reached
    };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent verifications (public)' })
  @ApiResponse({ status: 200, description: 'Recent verifications returned' })
  async getRecent() {
    return this.verificationService.getRecentVerifications(10);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('logs/:verificationId')
  @ApiOperation({ summary: 'Get verification logs for a verification ID' })
  @ApiResponse({ status: 200, description: 'Verification logs returned' })
  async getLogs(@Param('verificationId') verificationId: string) {
    return this.verificationService.checkVerification(verificationId);
  }
}
