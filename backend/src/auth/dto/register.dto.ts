import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString()
  fullName!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email!: string;

  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
