import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Cafe } from '../cafes/entities/cafe.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Cafe)
    private readonly cafesRepository: Repository<Cafe>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const { userId, cafeId, ...reviewData } = createReviewDto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Người dùng #${userId} không tìm thấy`);
    }

    const cafe = await this.cafesRepository.findOne({ where: { id: cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Quán cà phê #${cafeId} không tìm thấy`);
    }

    const review = this.reviewsRepository.create({ ...reviewData, user, cafe });
    return this.reviewsRepository.save(review);
  }

  findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({ relations: ['user', 'cafe'] });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'cafe'],
    });
    if (!review) {
      throw new NotFoundException(`Đánh giá #${id} không tìm thấy`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    const { userId, cafeId, ...reviewData } = updateReviewDto;

    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`Người dùng #${userId} không tìm thấy`);
      }
      review.user = user;
    }

    if (cafeId) {
      const cafe = await this.cafesRepository.findOne({
        where: { id: cafeId },
      });
      if (!cafe) {
        throw new NotFoundException(`Quán cà phê #${cafeId} không tìm thấy`);
      }
      review.cafe = cafe;
    }

    Object.assign(review, reviewData);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }
}
