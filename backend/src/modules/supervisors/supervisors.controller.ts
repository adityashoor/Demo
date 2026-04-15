import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupervisorsService } from './supervisors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Supervisor } from '../../database/entities/supervisor.entity';

@ApiTags('Supervisors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post() create(@Body() dto: Partial<Supervisor>) { return this.supervisorsService.create(dto); }
  @Get() findAll() { return this.supervisorsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.supervisorsService.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: Partial<Supervisor>) { return this.supervisorsService.update(id, dto); }
  @Post(':id/assign-worker') assignWorker(@Param('id') id: string, @Body('workerId') workerId: string) { return this.supervisorsService.assignWorker(id, workerId); }
  @Get(':id/workers') getWorkers(@Param('id') id: string) { return this.supervisorsService.getWorkers(id); }
}
