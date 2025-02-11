import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  userId: ObjectId;

  @IsNotEmpty()
  @IsString()
  serviceId: ObjectId;

  @IsNotEmpty()
  @IsString()
  bookingId: ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}
