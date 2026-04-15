import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { Worker } from './worker.entity';
import { Booking } from './booking.entity';

@Entity('supervisors')
export class Supervisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 15 })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionRate: number; // per worker per day

  @Column({ type: 'int', default: 50 })
  maxWorkerCapacity: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => Worker, w => w.supervisor)
  workers: Worker[];

  @OneToMany(() => Booking, b => b.supervisor)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
