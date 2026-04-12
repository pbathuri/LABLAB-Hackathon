import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CircleService } from './circle.service';
import { CircleWalletType } from './entities/circle-wallet.entity';

@ApiTags('circle')
@Controller('circle')
export class CircleController {
  constructor(private readonly circleService: CircleService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get Circle integration configuration status' })
  @ApiResponse({ status: 200, description: 'Configuration status returned' })
  getConfig() {
    return this.circleService.getConfigStatus();
  }

  @Get('requirements')
  @ApiOperation({ summary: 'Get required environment variables for Circle services' })
  @ApiResponse({ status: 200, description: 'Requirements returned' })
  getRequirements() {
    return this.circleService.getRequiredEnv();
  }

  @Post('wallets')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a Circle wallet (dev or user controlled)' })
  @ApiResponse({ status: 201, description: 'Wallet created' })
  createWallet(@Request() req: any, @Body() body: { type?: CircleWalletType; label?: string }) {
    return this.circleService.createWallet({
      userId: req.user.id,
      type: body.type,
      label: body.label,
    });
  }

  @Get('wallets')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List Circle wallets for the current user' })
  @ApiResponse({ status: 200, description: 'Wallet list returned' })
  listWallets(@Request() req: any) {
    return this.circleService.listWallets(req.user.id);
  }

  @Get('wallets/:walletId/balance')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get Circle wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance returned' })
  getWalletBalance(@Param('walletId') walletId: string) {
    return this.circleService.getWalletBalance(walletId);
  }

  @Post('gateway/settle')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a Gateway settlement transfer' })
  @ApiResponse({ status: 201, description: 'Gateway settlement created' })
  createGatewaySettlement(
    @Request() req: any,
    @Body()
    body: {
      amount: string;
      sourceChain: string;
      destinationChain: string;
      fromWalletId?: string;
      fromAddress?: string;
      toAddress?: string;
      referenceId?: string;
      notes?: string;
    },
  ) {
    return this.circleService.createGatewayTransfer({
      userId: req.user.id,
      amount: body.amount,
      sourceChain: body.sourceChain,
      destinationChain: body.destinationChain,
      fromWalletId: body.fromWalletId,
      fromAddress: body.fromAddress,
      toAddress: body.toAddress,
      referenceId: body.referenceId,
      notes: body.notes,
    });
  }

  @Get('gateway/transfers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List Gateway settlement transfers' })
  @ApiResponse({ status: 200, description: 'Gateway transfers returned' })
  listGatewayTransfers(@Request() req: any) {
    return this.circleService.listGatewayTransfers(req.user.id);
  }
}
