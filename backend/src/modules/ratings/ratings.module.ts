import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from '../../database/entities/rating.entity';
import { Worker } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Worker])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
