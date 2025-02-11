import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../service/entities/service.entity';
import { ObjectId } from 'mongodb';

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
      where: { _id: new ObjectId(createBookingDto.userId) },
    });
    const vendor = await this.vendorRepository.findOne({
      where: { _id: new ObjectId(createBookingDto.serviceId) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const booking = this.bookingRepository.create({
      firstName: createBookingDto.firstName,
      lastName: createBookingDto.lastName,
      phone: createBookingDto.phone,
      address: createBookingDto.address,
      note: createBookingDto.note,
      date: createBookingDto.date,
      time: createBookingDto.time,
      status: 'pending',
      serviceId: createBookingDto.serviceId,
      userId: createBookingDto.userId,
    });

    return await this.bookingRepository.save(booking);
  }

  async confirmBooking(bookingId: ObjectId) {
    const booking = await this.bookingRepository.findOne({
      where: { _id: new ObjectId(bookingId) },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending')
      throw new BadRequestException('Booking cannot be confirmed');

    booking.status = 'confirmed';
    return await this.bookingRepository.save(booking);
  }

  async cancelBooking(bookingId: ObjectId) {
    const booking = await this.bookingRepository.findOne({
      where: { _id: new ObjectId(bookingId) },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = 'cancelled';
    return await this.bookingRepository.save(booking);
  }

  async rescheduleBooking(oldBookingId: ObjectId, newDate: string) {
    const oldBooking = await this.bookingRepository.findOne({
      where: { _id: new ObjectId(oldBookingId) },
    });
    if (!oldBooking) throw new NotFoundException('Old booking not found');

    // Create new pending booking
    const newBooking = this.bookingRepository.create({
      firstName: oldBooking.firstName,
      lastName: oldBooking.lastName,
      phone: oldBooking.phone,
      address: oldBooking.address,
      note: oldBooking.note,
      date: newDate,
      time: oldBooking.time,
      status: 'pending',
      serviceId: oldBooking.serviceId,
      userId: oldBooking.userId,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Delete old booking (since it was pending and is now replaced)
    await this.bookingRepository.delete(oldBookingId);

    return savedBooking;
  }

  async getUserBookings(userId: ObjectId) {
    return await this.bookingRepository.find({ where: { userId } });
  }

  async getServiceBookings(serviceId: ObjectId) {
    return await this.bookingRepository.find({ where: { serviceId } });
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
