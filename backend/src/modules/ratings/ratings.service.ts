import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../../database/entities/rating.entity';
import { Worker } from '../../database/entities/worker.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
  ) {}

  async create(dto: {
    workerId: string; businessId: string; bookingId?: string;
    punctualityScore: number; qualityScore: number; behaviorScore: number;
    comment?: string;
  }): Promise<Rating> {
    const overall = ((dto.punctualityScore + dto.qualityScore + dto.behaviorScore) / 3);
    const rating = this.ratingRepo.create({ ...dto, overallScore: Math.round(overall * 100) / 100 });
    const saved = await this.ratingRepo.save(rating);

    // Recalculate worker's reliability score
    await this.updateWorkerScore(dto.workerId);
    return saved;
  }

  private async updateWorkerScore(workerId: string): Promise<void> {
    const result = await this.ratingRepo
      .createQueryBuilder('r')
      .select('AVG(r.overallScore)', 'avg')
      .where('r.workerId = :workerId', { workerId })
      .getRawOne();

    const avgRating = parseFloat(result?.avg || '3');
    await this.workerRepo.update(workerId, { reliabilityScore: Math.round(avgRating * 100) / 100 });
  }

  async getWorkerRatings(workerId: string) {
    return this.ratingRepo.find({
      where: { workerId },
      relations: ['business'],
      order: { createdAt: 'DESC' },
    });
  }
}
