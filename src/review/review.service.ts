import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Service } from 'src/service/entities/service.entity';
import { ObjectId } from 'mongodb';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>,
  ) {}

  async addReview(dto: CreateReviewDto) {
    if (!dto.userId || !dto.serviceId || !dto.bookingId) {
      throw new BadRequestException(
        'User ID, Service ID, and Booking ID are required',
      );
    }
    const review = this.reviewRepository.create(dto);

    await this.updateServiceAverageRating(dto.serviceId);

    return await this.reviewRepository.save(review);
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
    const reviewer = await this.userRepostiory.findOne({
      where: { serviceId: serviceId },
    });
    const review = await this.reviewRepository.find({ where: { serviceId } });
    return { review: review, reviewer: reviewer };
  }
}
