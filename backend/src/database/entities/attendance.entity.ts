import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Worker } from './worker.entity';
import { Booking } from './booking.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  EXCUSED = 'excused',
}

export enum CheckInMethod {
  SUPERVISOR = 'supervisor',
  QR_SCAN = 'qr_scan',
  OTP = 'otp',
  WHATSAPP = 'whatsapp',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workerId: string;

  @ManyToOne(() => Worker, w => w.attendances)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column()
  bookingId: string;

  @ManyToOne(() => Booking, b => b.attendances)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ type: 'enum', enum: CheckInMethod, default: CheckInMethod.SUPERVISOR })
  checkInMethod: CheckInMethod;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursWorked: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ default: false })
  otpVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
