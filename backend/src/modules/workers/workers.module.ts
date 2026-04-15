import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';
import { Worker } from '../../database/entities/worker.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Rating } from '../../database/entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Attendance, Rating])],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
