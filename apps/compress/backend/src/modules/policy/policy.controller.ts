import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PolicyService } from './policy.service';

class UpdatePolicyDto {
  maxTransactionAmount?: string;
  dailySpendingCap?: string;
  cooldownPeriodSeconds?: number;
  maxPriceDeviationPercent?: string;
  allowedAddresses?: string[];
  riskTolerance?: string;
}

@ApiTags('policy')
@Controller('policy')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  @ApiOperation({ summary: 'Get policy configuration for current user' })
  @ApiResponse({ status: 200, description: 'Policy config returned' })
  async getPolicy(@Request() req: any) {
    return this.policyService.getPolicyConfig(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update policy configuration' })
  @ApiResponse({ status: 200, description: 'Policy config updated' })
  async updatePolicy(@Request() req: any, @Body() dto: UpdatePolicyDto) {
    return this.policyService.updatePolicyConfig(req.user.id, dto);
  }
}
