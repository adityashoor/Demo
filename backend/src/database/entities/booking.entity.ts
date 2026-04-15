import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { Supervisor } from './supervisor.entity';
import { Attendance } from './attendance.entity';
import { SkillType } from './worker.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export enum ShiftType {
  MORNING = 'morning',    // 6am - 2pm
  AFTERNOON = 'afternoon', // 2pm - 10pm
  NIGHT = 'night',        // 10pm - 6am
  FULL_DAY = 'full_day',  // 8am - 8pm
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, b => b.bookings)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ nullable: true })
  supervisorId: string;

  @ManyToOne(() => Supervisor, s => s.bookings, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: Supervisor;

  @Column({ type: 'date' })
  shiftDate: Date;

  @Column({ type: 'enum', enum: ShiftType, default: ShiftType.FULL_DAY })
  shiftType: ShiftType;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'int' })
  workersRequired: number;

  @Column({ type: 'int', default: 0 })
  workersConfirmed: number;

  @Column({ type: 'int', default: 0 })
  workersPresent: number;

  @Column({ type: 'enum', enum: SkillType, default: SkillType.GENERAL })
  skillRequired: SkillType;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dailyWageOffered: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationLat: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationLng: number;

  @OneToMany(() => Attendance, a => a.booking)
  attendances: Attendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
