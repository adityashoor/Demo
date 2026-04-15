import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Rating } from './rating.entity';

export enum BusinessType {
  FACTORY = 'factory',
  WAREHOUSE = 'warehouse',
  SME = 'sme',
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Index({ unique: true })
  @Column()
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPersonName: string;

  @Column({ type: 'enum', enum: BusinessType, default: BusinessType.FACTORY })
  type: BusinessType;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  gstNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  creditBalance: number;

  @Column({ default: true })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Booking, b => b.business)
  bookings: Booking[];

  @OneToMany(() => Rating, r => r.business)
  ratingsGiven: Rating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
