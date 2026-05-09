import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.findUserOrThrow(userId);
    return this.toResponseDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.findUserOrThrow(userId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(
          'このメールアドレスはすでに使用されています。',
        );
      }
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    return this.toResponseDto(saved);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findUserOrThrow(userId);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('現在のパスワードが正しくありません。');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        '新しいパスワードは現在のパスワードと異なる必要があります。',
      );
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'パスワードを変更しました。' };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません。');
    }
    return user;
  }

  private async findUserOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません。');
    }
    return user;
  }

  private toResponseDto(user: User): ProfileResponseDto {
    return plainToInstance(ProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
