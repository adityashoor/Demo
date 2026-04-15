import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollRecord } from '../../database/entities/payroll-record.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Worker } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PayrollRecord, Attendance, Worker])],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
