import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentMethod } from '../../database/entities/payroll-record.entity';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('generate/booking/:bookingId')
  @ApiOperation({ summary: 'Auto-generate payroll from booking attendance' })
  generateFromBooking(@Param('bookingId') bookingId: string) {
    return this.payrollService.generateFromBooking(bookingId);
  }

  @Get('worker/:workerId')
  @ApiOperation({ summary: 'Get payroll records for a worker' })
  getWorkerPayroll(
    @Param('workerId') workerId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.payrollService.getWorkerPayroll(
      workerId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Post('mark-paid')
  @ApiOperation({ summary: 'Mark payroll records as paid' })
  markAsPaid(@Body() body: { ids: string[]; method: PaymentMethod; transactionId?: string }) {
    return this.payrollService.markAsPaid(body.ids, body.method, body.transactionId);
  }

  @Post('advance')
  @ApiOperation({ summary: 'Give an advance to a worker' })
  addAdvance(@Body() body: { workerId: string; amount: number; notes?: string }) {
    return this.payrollService.addAdvance(body.workerId, body.amount, body.notes);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending payroll summary' })
  getPendingSummary() {
    return this.payrollService.getPendingSummary();
  }

  @Get('report')
  @ApiOperation({ summary: 'Payroll report for date range' })
  getReport(@Query('from') from: string, @Query('to') to: string) {
    return this.payrollService.getPayrollReport(new Date(from), new Date(to));
  }
}
