import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ObjectId } from 'mongodb';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Review')
@ApiBearerAuth()
@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new review for a service' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiBody({ type: CreateReviewDto })
  async addReview(@Body() dto: CreateReviewDto) {
    return await this.reviewService.addReview(dto);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get all reviews for a service' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'Service not found or has no reviews',
  })
  @ApiParam({
    name: 'serviceId',
    type: 'string',
    description: 'ID of the service (MongoDB ObjectId)',
  })
  async getServiceReviews(@Param('serviceId') serviceId: ObjectId) {
    return await this.reviewService.getServiceReviews(serviceId);
  }
}
