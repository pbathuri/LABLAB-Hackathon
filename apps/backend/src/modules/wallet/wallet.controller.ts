import {
  Controller,
  Get,
  Post,
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
import { WalletService } from './wallet.service';

class SettlementDto {
  toAddress: string;
  amount: string;
  asset: string;
}

@ApiTags('wallet')
@Controller('wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new wallet for current user' })
  @ApiResponse({ status: 201, description: 'Wallet created' })
  async createWallet(@Request() req: any) {
    return this.walletService.createWallet(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({ status: 200, description: 'Wallet returned' })
  async getWallet(@Request() req: any) {
    return this.walletService.getWallet(req.user.id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance returned' })
  async getBalance(@Request() req: any) {
    const wallet = await this.walletService.getWallet(req.user.id);
    if (!wallet) {
      return { error: 'Wallet not found' };
    }
    return this.walletService.getBalance(wallet.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transactions returned' })
  async getTransactions(@Request() req: any) {
    const wallet = await this.walletService.getWallet(req.user.id);
    if (!wallet) {
      return [];
    }
    return this.walletService.getTransactionHistory(wallet.id);
  }

  @Post('settle')
  @ApiOperation({ summary: 'Execute a settlement transaction' })
  @ApiResponse({ status: 200, description: 'Settlement executed' })
  async executeSettlement(@Request() req: any, @Body() dto: SettlementDto) {
    const wallet = await this.walletService.getWallet(req.user.id);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    return this.walletService.executeSettlement(
      wallet.id,
      dto.toAddress,
      dto.amount,
      dto.asset,
    );
  }
}
