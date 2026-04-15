import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Worker, WorkerStatus } from '../../database/entities/worker.entity';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Attendance, AttendanceStatus } from '../../database/entities/attendance.entity';
import { PayrollRecord, PaymentStatus } from '../../database/entities/payroll-record.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(PayrollRecord) private payrollRepo: Repository<PayrollRecord>,
  ) {}

  async getDashboardOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalWorkers,
      availableWorkers,
      todayBookings,
      monthlyBookings,
      pendingPayroll,
      todayAttendance,
    ] = await Promise.all([
      this.workerRepo.count({ where: { isActive: true } }),
      this.workerRepo.count({ where: { status: WorkerStatus.AVAILABLE, isActive: true } }),
      this.bookingRepo.count({ where: { shiftDate: Between(today, tomorrow) as any } }),
      this.bookingRepo.count({ where: { shiftDate: Between(thisMonth, tomorrow) as any } }),
      this.payrollRepo
        .createQueryBuilder('p')
        .select('SUM(p.netAmount)', 'total')
        .where('p.paymentStatus = :status', { status: PaymentStatus.PENDING })
        .getRawOne(),
      this.attendanceRepo.count({
        where: { date: Between(today, tomorrow) as any, status: AttendanceStatus.PRESENT },
      }),
    ]);

    return {
      workers: {
        total: totalWorkers,
        available: availableWorkers,
        utilization: totalWorkers > 0 ? Math.round(((totalWorkers - availableWorkers) / totalWorkers) * 100) : 0,
      },
      bookings: {
        today: todayBookings,
        thisMonth: monthlyBookings,
      },
      attendance: {
        todayPresent: todayAttendance,
      },
      payroll: {
        pendingAmount: parseFloat(pendingPayroll?.total || '0'),
      },
    };
  }

  async getFulfillmentTrend(days = 30) {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const bookings = await this.bookingRepo.find({
        where: { shiftDate: Between(date, nextDay) as any },
      });

      const required = bookings.reduce((sum, b) => sum + b.workersRequired, 0);
      const present = bookings.reduce((sum, b) => sum + b.workersPresent, 0);

      data.push({
        date: date.toISOString().split('T')[0],
        required,
        present,
        fulfillmentRate: required > 0 ? Math.round((present / required) * 100) : 0,
      });
    }
    return data;
  }

  async getTopWorkers(limit = 10) {
    return this.workerRepo.find({
      where: { isActive: true },
      order: { reliabilityScore: 'DESC', totalShiftsCompleted: 'DESC' },
      take: limit,
      relations: ['supervisor'],
    });
  }

  async getSkillDemandAnalysis() {
    return this.bookingRepo
      .createQueryBuilder('b')
      .select('b.skillRequired', 'skill')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(b.workersRequired)', 'totalWorkers')
      .groupBy('b.skillRequired')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getDemandPrediction() {
    // Simple heuristic: same day last 4 weeks demand
    const predictions = [];
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      const dayOfWeek = targetDate.getDay();
      let totalRequired = 0;
      let samples = 0;

      for (let weeksBack = 1; weeksBack <= 4; weeksBack++) {
        const pastDate = new Date(targetDate);
        pastDate.setDate(pastDate.getDate() - weeksBack * 7);
        pastDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(pastDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const bookings = await this.bookingRepo.find({
          where: { shiftDate: Between(pastDate, nextDay) as any },
        });

        if (bookings.length > 0) {
          totalRequired += bookings.reduce((sum, b) => sum + b.workersRequired, 0);
          samples++;
        }
      }

      predictions.push({
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        predictedDemand: samples > 0 ? Math.round(totalRequired / samples) : 0,
      });
    }

    return predictions;
  }
}
