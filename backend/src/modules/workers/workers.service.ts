import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { Worker, WorkerStatus, SkillType } from '../../database/entities/worker.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerFilterDto } from './dto/worker-filter.dto';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private workerRepo: Repository<Worker>,
  ) {}

  async create(dto: CreateWorkerDto): Promise<Worker> {
    const existing = await this.workerRepo.findOne({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Worker with this phone already exists');

    const worker = this.workerRepo.create(dto);
    worker.reliabilityScore = 3.0; // default score
    return this.workerRepo.save(worker);
  }

  async findAll(filter: WorkerFilterDto) {
    const where: any = { isActive: true };

    if (filter.status) where.status = filter.status;
    if (filter.skill) where.skills = In([filter.skill]);
    if (filter.city) where.city = Like(`%${filter.city}%`);
    if (filter.supervisorId) where.supervisorId = filter.supervisorId;

    const [workers, total] = await this.workerRepo.findAndCount({
      where,
      relations: ['supervisor'],
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
      order: { reliabilityScore: 'DESC' },
    });

    return { workers, total, page: filter.page, limit: filter.limit };
  }

  async findOne(id: string): Promise<Worker> {
    const worker = await this.workerRepo.findOne({
      where: { id },
      relations: ['supervisor', 'ratings'],
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async findByPhone(phone: string): Promise<Worker | null> {
    return this.workerRepo.findOne({ where: { phone } });
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<Worker> {
    const worker = await this.findOne(id);
    Object.assign(worker, dto);
    return this.workerRepo.save(worker);
  }

  async updateStatus(id: string, status: WorkerStatus): Promise<Worker> {
    const worker = await this.findOne(id);
    worker.status = status;
    return this.workerRepo.save(worker);
  }

  async findAvailable(skill?: SkillType, city?: string, count?: number): Promise<Worker[]> {
    const qb = this.workerRepo.createQueryBuilder('w')
      .where('w.status = :status', { status: WorkerStatus.AVAILABLE })
      .andWhere('w.isActive = true')
      .orderBy('w.reliabilityScore', 'DESC');

    if (skill) qb.andWhere(':skill = ANY(w.skills)', { skill });
    if (city) qb.andWhere('w.city ILIKE :city', { city: `%${city}%` });
    if (count) qb.take(count);

    return qb.getMany();
  }

  async recalculateReliabilityScore(workerId: string): Promise<void> {
    const worker = await this.findOne(workerId);
    const total = worker.totalShiftsCompleted + worker.totalShiftsMissed;
    if (total === 0) return;

    const attendancePct = worker.totalShiftsCompleted / total; // 0-1
    // Weighted: 60% attendance, 40% ratings avg
    const reliabilityScore = Math.min(5, attendancePct * 3 + worker.reliabilityScore * 0.4);
    await this.workerRepo.update(workerId, {
      reliabilityScore: Math.round(reliabilityScore * 100) / 100,
    });
  }

  async remove(id: string): Promise<void> {
    const worker = await this.findOne(id);
    worker.isActive = false;
    await this.workerRepo.save(worker);
  }

  async getDashboardStats() {
    const [total, available, working, suspended] = await Promise.all([
      this.workerRepo.count({ where: { isActive: true } }),
      this.workerRepo.count({ where: { status: WorkerStatus.AVAILABLE, isActive: true } }),
      this.workerRepo.count({ where: { status: WorkerStatus.WORKING, isActive: true } }),
      this.workerRepo.count({ where: { status: WorkerStatus.SUSPENDED, isActive: true } }),
    ]);
    return { total, available, working, suspended };
  }
}
