import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../database/entities/business.entity';

@Injectable()
export class BusinessesService {
  constructor(@InjectRepository(Business) private repo: Repository<Business>) {}

  async create(dto: Partial<Business>): Promise<Business> {
    const existing = await this.repo.findOne({ where: { contactPhone: dto.contactPhone } });
    if (existing) throw new ConflictException('Business with this phone already exists');
    return this.repo.save(this.repo.create(dto));
  }

  async findAll() {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Business> {
    const biz = await this.repo.findOne({ where: { id }, relations: ['bookings'] });
    if (!biz) throw new NotFoundException('Business not found');
    return biz;
  }

  async update(id: string, dto: Partial<Business>): Promise<Business> {
    const biz = await this.findOne(id);
    Object.assign(biz, dto);
    return this.repo.save(biz);
  }

  async remove(id: string): Promise<void> {
    const biz = await this.findOne(id);
    biz.isActive = false;
    await this.repo.save(biz);
  }
}
