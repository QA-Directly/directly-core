import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ObjectId } from 'mongodb';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async addReview(@Body() dto: CreateReviewDto) {
    return await this.reviewService.addReview(dto);
  }

  @Get('service/:serviceId')
  async getServiceReviews(@Param('serviceId') serviceId: ObjectId) {
    return await this.reviewService.getServiceReviews(serviceId);
  }
}
