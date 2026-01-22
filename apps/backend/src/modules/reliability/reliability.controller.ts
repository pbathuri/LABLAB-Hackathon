import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReliabilityService } from './reliability.service';

class RegisterProviderDto {
  name: string;
  endpoint: string;
  description?: string;
  costPerCall?: string;
}

@ApiTags('reliability')
@Controller('reliability')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ReliabilityController {
  constructor(private readonly reliabilityService: ReliabilityService) {}

  @Post('provider')
  @ApiOperation({ summary: 'Register a new API provider' })
  @ApiResponse({ status: 201, description: 'Provider registered' })
  async registerProvider(@Body() dto: RegisterProviderDto) {
    return this.reliabilityService.registerProvider(
      dto.name,
      dto.endpoint,
      dto.description,
      dto.costPerCall,
    );
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get all providers sorted by reliability' })
  @ApiResponse({ status: 200, description: 'Providers returned' })
  async getProviders() {
    return this.reliabilityService.getProvidersByReliability(false);
  }

  @Get('best')
  @ApiOperation({ summary: 'Get the best available provider' })
  @ApiResponse({ status: 200, description: 'Best provider returned' })
  async getBestProvider() {
    return this.reliabilityService.selectBestProvider();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get provider reliability statistics' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  async getStats() {
    return this.reliabilityService.getProviderStats();
  }
}
