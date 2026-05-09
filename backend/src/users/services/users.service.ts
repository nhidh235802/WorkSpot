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

  // ─── Lấy thông tin hồ sơ ────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.findUserOrThrow(userId);
    return this.toResponseDto(user);
  }

  // ─── Cập nhật thông tin hồ sơ ───────────────────────────────────────────────
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.findUserOrThrow(userId);

    // Kiểm tra email trùng (nếu đổi email)
    if ((dto as any).email && (dto as any).email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: (dto as any).email },
      });
      if (existing) {
        throw new ConflictException(
          'Email này đã được sử dụng bởi tài khoản khác.',
        );
      }
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    return this.toResponseDto(saved);
  }

  // ─── Đổi mật khẩu ───────────────────────────────────────────────────────────
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findUserOrThrow(userId);

    // Kiểm tra xác nhận mật khẩu mới
    if ((dto as any).newPassword !== (dto as any).confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }

    const isMatch = await (bcrypt as any).compare(
      (dto as any).currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }

    if ((dto as any).currentPassword === (dto as any).newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
      );
    }

    const hashed = await (bcrypt as any).hash((dto as any).newPassword, 10);
    user.password = hashed;
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công.' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  private async findUserOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }
    return user;
  }

  private toResponseDto(user: User): ProfileResponseDto {
    return new (ProfileResponseDto as any)(
      plainToInstance(ProfileResponseDto as any, user, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
