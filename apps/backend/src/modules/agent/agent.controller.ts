import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
import { AgentService, AgentContext } from './agent.service';

class MakeDecisionDto {
  portfolioState: Record<string, number>;
  marketData?: Record<string, any>;
  riskTolerance?: number;
}

@ApiTags('agent')
@Controller('agent')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('decide')
  @ApiOperation({ summary: 'Request AI agent to make a trading decision' })
  @ApiResponse({ status: 201, description: 'Decision created and verification initiated' })
  async makeDecision(@Request() req: any, @Body() dto: MakeDecisionDto) {
    const context: AgentContext = {
      userId: req.user.id,
      portfolioState: dto.portfolioState || { USDC: 1000, BTC: 0.01, ETH: 0.5 },
      marketData: dto.marketData || {},
      riskTolerance: dto.riskTolerance || 0.5,
    };

    return this.agentService.makeDecision(context);
  }

  @Post('execute/:id')
  @ApiOperation({ summary: 'Execute a verified decision' })
  @ApiResponse({ status: 200, description: 'Decision executed' })
  @ApiResponse({ status: 400, description: 'Decision not verified or not found' })
  async executeDecision(@Param('id') id: string) {
    return this.agentService.executeDecision(id);
  }

  @Get('explain/:id')
  @ApiOperation({ summary: 'Get Captain Whiskers explanation for a decision' })
  @ApiResponse({ status: 200, description: 'Explanation returned' })
  async explainDecision(@Param('id') id: string) {
    const explanation = await this.agentService.explainDecision(id);
    return { explanation };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get decision history for current user' })
  @ApiResponse({ status: 200, description: 'Decision history returned' })
  async getHistory(@Request() req: any) {
    return this.agentService.getDecisionHistory(req.user.id);
  }
}
