import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
  @MaxLength(255, { message: 'Họ tên không được vượt quá 255 ký tự.' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)[0-9]{9}$/, {
    message: 'Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567).',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Bio không được vượt quá 1000 ký tự.' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL avatar không hợp lệ.' })
  avatar?: string;
}
