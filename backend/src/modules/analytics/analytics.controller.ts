import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Main dashboard overview stats' })
  getOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('fulfillment-trend')
  @ApiOperation({ summary: 'Labour fulfillment trend over days' })
  getFulfillmentTrend(@Query('days') days: number) {
    return this.analyticsService.getFulfillmentTrend(days || 30);
  }

  @Get('top-workers')
  @ApiOperation({ summary: 'Top workers by reliability score' })
  getTopWorkers(@Query('limit') limit: number) {
    return this.analyticsService.getTopWorkers(limit || 10);
  }

  @Get('skill-demand')
  @ApiOperation({ summary: 'Skill demand analysis across all bookings' })
  getSkillDemand() {
    return this.analyticsService.getSkillDemandAnalysis();
  }

  @Get('demand-prediction')
  @ApiOperation({ summary: 'Predicted labour demand for next 7 days' })
  getDemandPrediction() {
    return this.analyticsService.getDemandPrediction();
  }
}
