import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Service)
    private vendorRepository: Repository<Service>,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const user = await this.userRepository.findOne({
      where: { id: createBookingDto.userId },
    });
    const vendor = await this.vendorRepository.findOne({
      where: { id: createBookingDto.serviceId },
    });

    if (!user || !vendor) {
      throw new Error('User or Vendor not found');
    }

    const booking = this.bookingRepository.create({
      date: createBookingDto.date,
      time: createBookingDto.time,
      status: 'pending',
      serviceId: createBookingDto.serviceId,
      userId: createBookingDto.userId,
    });

    return await this.bookingRepository.save(booking);
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
