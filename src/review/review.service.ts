import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Service } from 'src/service/entities/service.entity';
import { ObjectId } from 'mongodb';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly userService: UsersService,
  ) {}

  async addReview(dto: CreateReviewDto) {
    if (!dto.userId || !dto.serviceId || !dto.bookingId) {
      throw new BadRequestException(
        'User ID, Service ID, and Booking ID are required',
      );
    }
    const review = this.reviewRepository.create(dto);
    await this.reviewRepository.save(review);

    await this.updateServiceAverageRating(dto.serviceId);
    const reviewer = await this.userService.findUser(dto.userId);
    return { review: review, reviewer: reviewer };
  }

  async updateServiceAverageRating(serviceId: ObjectId) {
    const reviews = await this.reviewRepository.find({
      where: { serviceId: new ObjectId(serviceId) },
    });

    if (reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await this.serviceRepository.update(serviceId, {
      averageRating: parseFloat(avgRating.toFixed(2)),
    });
  }

  async getServiceReviews(serviceId: ObjectId) {
    return await this.reviewRepository.find({ where: { serviceId } });
  }
}
