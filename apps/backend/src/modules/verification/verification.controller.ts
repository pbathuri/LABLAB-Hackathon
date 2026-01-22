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
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get BFT verification network statistics' })
  @ApiResponse({ status: 200, description: 'Verification stats returned' })
  async getStats() {
    return this.verificationService.getVerificationStats();
  }

  @Get('logs/:decisionId')
  @ApiOperation({ summary: 'Get verification logs for a decision' })
  @ApiResponse({ status: 200, description: 'Verification logs returned' })
  async getLogs(@Param('decisionId') decisionId: string) {
    return this.verificationService.getVerificationLogs(decisionId);
  }
}
