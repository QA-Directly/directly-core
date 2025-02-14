import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Service } from 'src/service/entities/service.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Service]), UsersModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
