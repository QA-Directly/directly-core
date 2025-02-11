import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  userId: ObjectId;

  @IsNotEmpty()
  @IsString()
  serviceId: ObjectId;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  note?: string;
}
