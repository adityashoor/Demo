import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Worker } from '../../database/entities/worker.entity';
import { Booking } from '../../database/entities/booking.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { PayrollRecord } from '../../database/entities/payroll-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Booking, Attendance, PayrollRecord])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
