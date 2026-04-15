import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { Supervisor } from './supervisor.entity';
import { Attendance } from './attendance.entity';
import { Rating } from './rating.entity';
import { PayrollRecord } from './payroll-record.entity';

export enum WorkerStatus {
  AVAILABLE = 'available',
  WORKING = 'working',
  UNAVAILABLE = 'unavailable',
  SUSPENDED = 'suspended',
}

export enum SkillType {
  PACKING = 'packing',
  LOADING = 'loading',
  UNLOADING = 'unloading',
  MANUFACTURING = 'manufacturing',
  GENERAL = 'general',
}

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 15 })
  phone: string;

  @Column({ nullable: true })
  alternatePhone: string;

  @Column({ nullable: true })
  aadhaarNumber: string;

  @Column({ type: 'enum', enum: SkillType, array: true, default: [SkillType.GENERAL] })
  skills: SkillType[];

  @Column({ type: 'enum', enum: WorkerStatus, default: WorkerStatus.AVAILABLE })
  status: WorkerStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  reliabilityScore: number;

  @Column({ type: 'int', default: 0 })
  totalShiftsCompleted: number;

  @Column({ type: 'int', default: 0 })
  totalShiftsMissed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyWageRate: number;

  @Column({ nullable: true })
  preferredLanguage: string;

  @Column({ default: false })
  hasSmartphone: boolean;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  supervisorId: string;

  @ManyToOne(() => Supervisor, supervisor => supervisor.workers, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: Supervisor;

  @OneToMany(() => Attendance, att => att.worker)
  attendances: Attendance[];

  @OneToMany(() => Rating, r => r.worker)
  ratings: Rating[];

  @OneToMany(() => PayrollRecord, p => p.worker)
  payrollRecords: PayrollRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get attendancePercentage(): number {
    const total = this.totalShiftsCompleted + this.totalShiftsMissed;
    if (total === 0) return 100;
    return Math.round((this.totalShiftsCompleted / total) * 100);
  }
}
