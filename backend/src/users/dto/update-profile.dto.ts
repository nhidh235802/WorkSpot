import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email?: string;

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
}
