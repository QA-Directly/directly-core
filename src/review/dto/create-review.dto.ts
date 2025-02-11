import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID (MongoDB ObjectId)', type: 'string' })
  userId: ObjectId;

  @IsNotEmpty()
  @ApiProperty({ description: 'Service ID (MongoDB ObjectId)', type: 'string' })
  serviceId: ObjectId;

  @IsNotEmpty()
  @ApiProperty({ description: 'Booking ID (MongoDB ObjectId)', type: 'string' })
  bookingId: ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    description: 'Rating between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Review comment' })
  comment: string;
}
