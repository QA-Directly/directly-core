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
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiBody({ type: CreateBookingDto })
  async createBooking(
    @Body('bookingDetails') bookingDetails: CreateBookingDto,
  ) {
    return await this.bookingService.create(bookingDetails);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async confirmBooking(@Param('id') bookingId: ObjectId) {
    return await this.bookingService.confirmBooking(bookingId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async cancelBooking(@Param('id') bookingId: ObjectId) {
    return await this.bookingService.cancelBooking(bookingId);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a booking' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({ status: 404, description: 'Old booking not found' })
  @ApiParam({ name: 'id', description: 'Old Booking ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { newDate: { type: 'string', example: '2025-03-10' } },
    },
  })
  async rescheduleBooking(
    @Param('id') oldBookingId: ObjectId,
    @Body('newDate') newDate: string,
  ) {
    return await this.bookingService.rescheduleBooking(oldBookingId, newDate);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: "Get a user's bookings" })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUserBookings(@Param('userId') userId: ObjectId) {
    return await this.bookingService.getUserBookings(userId);
  }

  @Get('/service/:serviceId')
  @ApiOperation({ summary: 'Get all bookings for a service provider' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
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
