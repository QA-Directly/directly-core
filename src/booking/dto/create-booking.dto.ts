import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID (MongoDB ObjectId)', type: 'string' })
  userId: ObjectId;

  @IsNotEmpty()
  @ApiProperty({ description: 'Service ID (MongoDB ObjectId)', type: 'string' })
  serviceId: ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'First name of the user' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Last name of the user' })
  lastName: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ description: 'Selected booking date (YYYY-MM-DD format)' })
  date: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Selected booking time' })
  time?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Booking address' })
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;
}
