import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PayrollRecord, PaymentStatus, PaymentMethod } from '../../database/entities/payroll-record.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { Worker } from '../../database/entities/worker.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRecord) private payrollRepo: Repository<PayrollRecord>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
  ) {}

  // Auto-generate payroll from attendance records
  async generateFromBooking(bookingId: string): Promise<PayrollRecord[]> {
    const attendances = await this.attendanceRepo.find({
      where: { bookingId },
      relations: ['worker', 'booking'],
    });

    const records: PayrollRecord[] = [];

    for (const att of attendances) {
      if (att.status === AttendanceStatus.ABSENT) continue;

      const existing = await this.payrollRepo.findOne({
        where: { workerId: att.workerId, bookingId: att.bookingId },
      });
      if (existing) continue;

      const baseWage = att.worker.dailyWageRate || 400; // default ₹400/day
      const multiplier = att.status === AttendanceStatus.HALF_DAY ? 0.5 : 1;
      const hoursMultiplier = att.hoursWorked && att.hoursWorked > 8
        ? (att.hoursWorked - 8) * (baseWage / 8) * 1.5 : 0; // overtime 1.5x

      const record = this.payrollRepo.create({
        workerId: att.workerId,
        bookingId: att.bookingId,
        workDate: att.date,
        baseWage: baseWage * multiplier,
        overtime: hoursMultiplier,
        advance: 0,
        deductions: 0,
        netAmount: baseWage * multiplier + hoursMultiplier,
        paymentStatus: PaymentStatus.PENDING,
      });

      records.push(await this.payrollRepo.save(record));
    }

    return records;
  }

  async getWorkerPayroll(workerId: string, from?: Date, to?: Date) {
    const where: any = { workerId };
    if (from && to) where.workDate = Between(from, to);

    const records = await this.payrollRepo.find({
      where,
      order: { workDate: 'DESC' },
    });

    const totalEarned = records.reduce((sum, r) => sum + Number(r.netAmount), 0);
    const totalPaid = records
      .filter(r => r.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, r) => sum + Number(r.netAmount), 0);
    const pending = totalEarned - totalPaid;

    return { records, totalEarned, totalPaid, pending };
  }

  async markAsPaid(ids: string[], method: PaymentMethod, transactionId?: string): Promise<void> {
    for (const id of ids) {
      await this.payrollRepo.update(id, {
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: method,
        transactionId,
        paidAt: new Date(),
      });
    }
  }

  async addAdvance(workerId: string, amount: number, notes?: string): Promise<PayrollRecord> {
    const worker = await this.workerRepo.findOne({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');

    const record = this.payrollRepo.create({
      workerId,
      workDate: new Date(),
      baseWage: 0,
      overtime: 0,
      advance: amount,
      deductions: 0,
      netAmount: -amount, // negative because it's owed back
      paymentStatus: PaymentStatus.PAID,
      notes: notes || 'Advance payment',
    });

    return this.payrollRepo.save(record);
  }

  async getPendingSummary() {
    const pending = await this.payrollRepo.find({
      where: { paymentStatus: PaymentStatus.PENDING },
      relations: ['worker'],
    });

    const totalPending = pending.reduce((sum, r) => sum + Number(r.netAmount), 0);
    const workerCount = new Set(pending.map(r => r.workerId)).size;

    return { totalPending, workerCount, records: pending };
  }

  async getPayrollReport(from: Date, to: Date) {
    const records = await this.payrollRepo.find({
      where: { workDate: Between(from, to) },
      relations: ['worker'],
    });

    const totalAmount = records.reduce((sum, r) => sum + Number(r.netAmount), 0);
    const paidAmount = records.filter(r => r.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, r) => sum + Number(r.netAmount), 0);

    return {
      period: { from, to },
      totalRecords: records.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      records,
    };
  }
}
