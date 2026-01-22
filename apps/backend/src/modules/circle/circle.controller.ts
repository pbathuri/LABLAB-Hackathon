import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CircleService } from './circle.service';

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
}
