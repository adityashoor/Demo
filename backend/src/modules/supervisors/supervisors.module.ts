import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { Supervisor } from '../../database/entities/supervisor.entity';
import { Worker } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supervisor, Worker])],
  controllers: [SupervisorsController],
  providers: [SupervisorsService],
  exports: [SupervisorsService],
})
export class SupervisorsModule {}
