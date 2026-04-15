import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../../database/entities/booking.entity';
import { Worker } from '../../database/entities/worker.entity';
import { Supervisor } from '../../database/entities/supervisor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Worker, Supervisor])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
