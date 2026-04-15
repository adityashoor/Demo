import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Worker } from './worker.entity';
import { Business } from './business.entity';
import { Booking } from './booking.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workerId: string;

  @ManyToOne(() => Worker, w => w.ratings)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, b => b.ratingsGiven)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ nullable: true })
  bookingId: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'int' })
  punctualityScore: number; // 1-5

  @Column({ type: 'int' })
  qualityScore: number; // 1-5

  @Column({ type: 'int' })
  behaviorScore: number; // 1-5

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  overallScore: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
