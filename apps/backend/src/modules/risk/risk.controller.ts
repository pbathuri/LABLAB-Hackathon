import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, IsNumberString } from 'class-validator';
import { ethers } from 'ethers';
import { isValidHexPrivateKey } from '../../common/eth-key.util';
import { RiskService, TradeIntentStruct } from './risk.service';

class ValidateIntentDto {
  @IsString()
  agent!: string;

  @IsString()
  tokenIn!: string;

  @IsString()
  tokenOut!: string;

  @IsNumberString()
  amountIn!: string;

  @IsNumberString()
  minAmountOut!: string;

  @IsNumberString()
  deadline!: string;

  @IsString()
  strategyHash!: string;

  @IsNumberString()
  portfolioNav!: string;
}

@ApiTags('risk')
@Controller('api/risk')
export class RiskController {
  constructor(private readonly risk: RiskService) { }

  @Get('context')
  @ApiOperation({
    summary: 'Env-derived addresses for RiskRouter demos (agent + mock tokens)',
  })
  context() {
    let agentAddress = process.env.AGENT_ADDRESS?.trim() ?? '';
    const pk = process.env.AGENT_PRIVATE_KEY;
    if (!agentAddress && pk && isValidHexPrivateKey(pk)) {
      agentAddress = new ethers.Wallet(pk.trim()).address;
    }
    return {
      agentAddress,
      mockUsdc: process.env.MOCK_USDC_ADDRESS ?? '',
      mockWeth: process.env.MOCK_WETH_ADDRESS ?? '',
      riskRouterAddress: process.env.RISK_ROUTER_ADDRESS ?? '',
      riskRouterConfigured: Boolean(process.env.RISK_ROUTER_ADDRESS?.trim()),
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate trade intent on RiskRouter' })
  async validate(@Body() dto: ValidateIntentDto) {
    const intent: TradeIntentStruct = {
      agent: dto.agent,
      tokenIn: dto.tokenIn,
      tokenOut: dto.tokenOut,
      amountIn: BigInt(dto.amountIn),
      minAmountOut: BigInt(dto.minAmountOut),
      deadline: BigInt(dto.deadline),
      strategyHash: dto.strategyHash,
      portfolioNav: BigInt(dto.portfolioNav),
    };
    return this.risk.validateIntent(intent);
  }
}
