import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ERC8004Service } from './erc8004.service';

class RegisterDto {
  @IsString()
  agentURI!: string;
}

class FeedbackDto {
  @IsNumber()
  pnlPercent!: number;

  @IsNumber()
  sharpeRatio!: number;

  @IsNumber()
  maxDrawdownBps!: number;

  @IsNumber()
  winRate!: number;
}

@ApiTags('identity')
@Controller('api/identity')
export class ERC8004Controller {
  constructor(private readonly erc8004: ERC8004Service) { }

  @Post('register')
  @ApiOperation({ summary: 'Register agent URI on ERC-8004' })
  async register(@Body() dto: RegisterDto) {
    return this.erc8004.registerAgent(dto.agentURI);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Post performance feedback to reputation registry' })
  async feedback(@Body() dto: FeedbackDto) {
    await this.erc8004.postPerformanceFeedback(dto);
    return { ok: true };
  }

  @Get('status')
  @ApiOperation({ summary: 'Agent identity status' })
  status() {
    return this.erc8004.getStatus();
  }
}
