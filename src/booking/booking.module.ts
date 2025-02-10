import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../service/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Service])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
