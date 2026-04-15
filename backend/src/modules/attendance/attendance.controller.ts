import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { OtpCheckInDto } from './dto/otp-checkin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('booking/:bookingId/bulk')
  @ApiOperation({ summary: 'Supervisor marks attendance for all workers in a booking' })
  markBulk(@Param('bookingId') bookingId: string, @Body() records: MarkAttendanceDto[]) {
    return this.attendanceService.markBulk(bookingId, records);
  }

  @Post('otp/generate')
  @ApiOperation({ summary: 'Generate OTP for worker self check-in' })
  generateOtp(@Body() body: { workerId: string; bookingId: string }) {
    return this.attendanceService.generateOtp(body.workerId, body.bookingId);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and mark worker present' })
  verifyOtp(@Body() dto: OtpCheckInDto) {
    return this.attendanceService.verifyOtp(dto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get attendance for a booking' })
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.attendanceService.getByBooking(bookingId);
  }

  @Get('worker/:workerId/history')
  @ApiOperation({ summary: 'Get worker attendance history' })
  getWorkerHistory(@Param('workerId') workerId: string, @Query('days') days: number) {
    return this.attendanceService.getWorkerHistory(workerId, days);
  }

  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily attendance report' })
  getDailyReport(@Query('date') date: string) {
    return this.attendanceService.getDailyReport(new Date(date || new Date()));
  }
}
