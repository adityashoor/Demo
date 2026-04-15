import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Business } from '../../database/entities/business.entity';

@ApiTags('Businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post() create(@Body() dto: Partial<Business>) { return this.businessesService.create(dto); }
  @Get() findAll() { return this.businessesService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.businessesService.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: Partial<Business>) { return this.businessesService.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id') id: string) { return this.businessesService.remove(id); }
}
