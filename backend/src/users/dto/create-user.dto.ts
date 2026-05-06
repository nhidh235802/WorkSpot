import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email!: string;

  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
