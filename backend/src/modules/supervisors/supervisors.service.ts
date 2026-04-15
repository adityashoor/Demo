import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supervisor } from '../../database/entities/supervisor.entity';
import { Worker } from '../../database/entities/worker.entity';

@Injectable()
export class SupervisorsService {
  constructor(
    @InjectRepository(Supervisor) private repo: Repository<Supervisor>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
  ) {}

  async create(dto: Partial<Supervisor>): Promise<Supervisor> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll() {
    return this.repo.find({
      where: { isActive: true },
      relations: ['workers'],
      order: { rating: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Supervisor> {
    const sup = await this.repo.findOne({ where: { id }, relations: ['workers'] });
    if (!sup) throw new NotFoundException('Supervisor not found');
    return sup;
  }

  async update(id: string, dto: Partial<Supervisor>): Promise<Supervisor> {
    const sup = await this.findOne(id);
    Object.assign(sup, dto);
    return this.repo.save(sup);
  }

  async assignWorker(supervisorId: string, workerId: string): Promise<Worker> {
    const worker = await this.workerRepo.findOne({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    worker.supervisorId = supervisorId;
    return this.workerRepo.save(worker);
  }

  async getWorkers(supervisorId: string) {
    return this.workerRepo.find({ where: { supervisorId, isActive: true } });
  }
}
