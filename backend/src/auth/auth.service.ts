import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole, UserStatus } from '../users/entities/user.entity'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existing = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role ?? UserRole.CUSTOMER,
    });

    const saved = await this.usersRepository.save(user);
    const { password: _, ...result } = saved;
    return result;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    // 1. Kiểm tra sự tồn tại tài khoản và đối chiếu mật khẩu hash
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    // 2. CHẶN ĐĂNG NHẬP NẾU TÀI KHOẢN KHÔNG Ở TRẠNG THÁI ACTIVE
    if (user.status && user.status !== UserStatus.ACTIVE) {
      if (user.status === UserStatus.DISABLED) {
        throw new UnauthorizedException({
          message: 'このアカウントは無効化されています。管理者にお問い合わせください。',
          code: 'ACCOUNT_DISABLED',
          status: 'disabled',
          reason: user.disabledReason ?? null,
        });
      }
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException({
          message: 'このアカウントは利用停止処分を受けています。',
          code: 'ACCOUNT_DISABLED',
          status: 'suspended',
          reason: user.disabledReason ?? null,
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('メールアドレスが見つかりません。');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await this.usersRepository.save(user);

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordReset(user.email, resetLink);

    return {
      message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { resetPasswordToken: dto.token },
    });

    if (
      !user ||
      !user.resetPasswordExpiry ||
      user.resetPasswordExpiry < new Date()
    ) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
      );
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await this.usersRepository.save(user);

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }
}