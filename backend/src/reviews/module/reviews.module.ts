import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from '../services/reviews.service';
import { ReviewsController } from '../controllers/reviews.controller';
import { Review } from '../entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { Cafe } from '../../cafes/entities/cafe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Cafe])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
