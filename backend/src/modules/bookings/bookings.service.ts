import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from '../../database/entities/booking.entity';
import { Worker, WorkerStatus } from '../../database/entities/worker.entity';
import { Supervisor } from '../../database/entities/supervisor.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Supervisor) private supervisorRepo: Repository<Supervisor>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Auto-assign best available supervisor if not specified
    if (!dto.supervisorId) {
      const supervisor = await this.findBestSupervisor(dto.workersRequired, dto.city);
      if (supervisor) dto.supervisorId = supervisor.id;
    }

    const booking = this.bookingRepo.create(dto);
    const saved = await this.bookingRepo.save(booking);

    // Mark workers as booked
    await this.assignWorkersToBooking(saved);

    return this.findOne(saved.id);
  }

  private async findBestSupervisor(workersNeeded: number, city?: string): Promise<Supervisor | null> {
    const qb = this.supervisorRepo.createQueryBuilder('s')
      .where('s.isActive = true')
      .andWhere('s.maxWorkerCapacity >= :needed', { needed: workersNeeded })
      .orderBy('s.rating', 'DESC')
      .limit(1);

    if (city) qb.andWhere('s.city ILIKE :city', { city: `%${city}%` });

    return qb.getOne();
  }

  private async assignWorkersToBooking(booking: Booking): Promise<void> {
    // Find available workers for this shift
    const workers = await this.workerRepo.createQueryBuilder('w')
      .where('w.status = :status', { status: WorkerStatus.AVAILABLE })
      .andWhere('w.isActive = true')
      .andWhere(booking.supervisorId ? 'w.supervisorId = :sid' : '1=1', { sid: booking.supervisorId })
      .take(booking.workersRequired)
      .getMany();

    booking.workersConfirmed = workers.length;
    booking.status = workers.length >= booking.workersRequired
      ? BookingStatus.CONFIRMED
      : workers.length > 0
        ? BookingStatus.PARTIAL
        : BookingStatus.PENDING;

    await this.bookingRepo.save(booking);

    // Mark workers as working
    if (workers.length > 0) {
      await this.workerRepo.update(workers.map(w => w.id), { status: WorkerStatus.WORKING });
    }
  }

  async findAll(filters: any) {
    const where: any = {};
    if (filters.businessId) where.businessId = filters.businessId;
    if (filters.status) where.status = filters.status;
    if (filters.date) where.shiftDate = filters.date;

    const [bookings, total] = await this.bookingRepo.findAndCount({
      where,
      relations: ['business', 'supervisor'],
      order: { shiftDate: 'DESC' },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
    });

    return { bookings, total };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['business', 'supervisor', 'attendances', 'attendances.worker'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async getTodaysSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await this.bookingRepo.find({
      where: { shiftDate: Between(today, tomorrow) as any },
      relations: ['business'],
    });

    const totalRequired = bookings.reduce((sum, b) => sum + b.workersRequired, 0);
    const totalConfirmed = bookings.reduce((sum, b) => sum + b.workersConfirmed, 0);
    const totalPresent = bookings.reduce((sum, b) => sum + b.workersPresent, 0);

    return {
      date: today,
      totalBookings: bookings.length,
      workersRequired: totalRequired,
      workersConfirmed: totalConfirmed,
      workersPresent: totalPresent,
      fulfillmentRate: totalRequired > 0 ? Math.round((totalPresent / totalRequired) * 100) : 0,
      bookings,
    };
  }
}
