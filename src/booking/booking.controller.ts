import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ObjectId } from 'mongodb';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Body('bookingDetails') bookingDetails: CreateBookingDto,
  ) {
    return await this.bookingService.create(bookingDetails);
  }

  @Patch(':id/confirm')
  async confirmBooking(@Param('id') bookingId: ObjectId) {
    return await this.bookingService.confirmBooking(bookingId);
  }

  @Patch(':id/cancel')
  async cancelBooking(@Param('id') bookingId: ObjectId) {
    return await this.bookingService.cancelBooking(bookingId);
  }

  @Post(':id/reschedule')
  async rescheduleBooking(
    @Param('id') oldBookingId: ObjectId,
    @Body('newScheduledAt') newDate: string,
  ) {
    return await this.bookingService.rescheduleBooking(oldBookingId, newDate);
  }

  @Get('/user/:userId')
  async getUserBookings(@Param('userId') userId: ObjectId) {
    return await this.bookingService.getUserBookings(userId);
  }

  @Get('/service/:serviceId')
  async getVendorBookings(@Param('serviceId') serviceId: ObjectId) {
    return await this.bookingService.getServiceBookings(serviceId);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}
