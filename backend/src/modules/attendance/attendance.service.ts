import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus, CheckInMethod } from '../../database/entities/attendance.entity';
import { Worker } from '../../database/entities/worker.entity';
import { Booking } from '../../database/entities/booking.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { OtpCheckInDto } from './dto/otp-checkin.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  // Supervisor marks attendance for multiple workers at once
  async markBulk(bookingId: string, records: MarkAttendanceDto[]): Promise<Attendance[]> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const attendances: Attendance[] = [];

    for (const record of records) {
      const existing = await this.attendanceRepo.findOne({
        where: { workerId: record.workerId, bookingId },
      });

      if (existing) {
        Object.assign(existing, record);
        attendances.push(await this.attendanceRepo.save(existing));
      } else {
        const att = this.attendanceRepo.create({
          ...record,
          bookingId,
          date: booking.shiftDate,
          checkInMethod: CheckInMethod.SUPERVISOR,
        });
        attendances.push(await this.attendanceRepo.save(att));
      }
    }

    // Update booking workers present count
    const presentCount = await this.attendanceRepo.count({
      where: { bookingId, status: AttendanceStatus.PRESENT },
    });
    await this.bookingRepo.update(bookingId, { workersPresent: presentCount });

    // Update worker stats
    for (const att of attendances) {
      await this.updateWorkerStats(att.workerId, att.status);
    }

    return attendances;
  }

  // OTP-based self check-in for workers with phones
  async generateOtp(workerId: string, bookingId: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let att = await this.attendanceRepo.findOne({ where: { workerId, bookingId } });

    if (!att) {
      const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
      att = this.attendanceRepo.create({
        workerId, bookingId,
        date: booking.shiftDate,
        otpCode: otp,
        status: AttendanceStatus.ABSENT,
      });
    } else {
      att.otpCode = otp;
    }

    await this.attendanceRepo.save(att);
    // In production: send OTP via SMS/WhatsApp
    return otp;
  }

  async verifyOtp(dto: OtpCheckInDto): Promise<Attendance> {
    const att = await this.attendanceRepo.findOne({
      where: { workerId: dto.workerId, bookingId: dto.bookingId },
    });

    if (!att || att.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    att.otpVerified = true;
    att.status = AttendanceStatus.PRESENT;
    att.checkInTime = new Date();
    att.checkInMethod = CheckInMethod.OTP;
    return this.attendanceRepo.save(att);
  }

  async getByBooking(bookingId: string) {
    return this.attendanceRepo.find({
      where: { bookingId },
      relations: ['worker'],
    });
  }

  async getWorkerHistory(workerId: string, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.attendanceRepo.find({
      where: { workerId },
      order: { date: 'DESC' },
      take: days,
    });
  }

  private async updateWorkerStats(workerId: string, status: AttendanceStatus): Promise<void> {
    const worker = await this.workerRepo.findOne({ where: { id: workerId } });
    if (!worker) return;

    if (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) {
      worker.totalShiftsCompleted++;
    } else if (status === AttendanceStatus.ABSENT) {
      worker.totalShiftsMissed++;
    }

    await this.workerRepo.save(worker);
  }

  async getDailyReport(date: Date) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.worker', 'w')
      .leftJoinAndSelect('a.booking', 'b')
      .leftJoinAndSelect('b.business', 'biz')
      .where('a.date = :date', { date });

    const records = await qb.getMany();
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const late = records.filter(r => r.status === AttendanceStatus.LATE).length;

    return { date, total: records.length, present, absent, late, records };
  }
}
