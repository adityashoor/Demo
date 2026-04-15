import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerFilterDto } from './dto/worker-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkerStatus, SkillType } from '../../database/entities/worker.entity';

@ApiTags('Workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new worker' })
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all workers with filters' })
  findAll(@Query() filter: WorkerFilterDto) {
    return this.workersService.findAll(filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Worker dashboard statistics' })
  getStats() {
    return this.workersService.getDashboardStats();
  }

  @Get('available')
  @ApiOperation({ summary: 'Find available workers for a booking' })
  findAvailable(
    @Query('skill') skill: SkillType,
    @Query('city') city: string,
    @Query('count') count: number,
  ) {
    return this.workersService.findAvailable(skill, city, count);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific worker' })
  findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update worker profile' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update worker status' })
  updateStatus(@Param('id') id: string, @Body('status') status: WorkerStatus) {
    return this.workersService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a worker' })
  remove(@Param('id') id: string) {
    return this.workersService.remove(id);
  }
}
