import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống.' })
  @IsString()
  currentPassword!: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
  @MaxLength(100, { message: 'Mật khẩu mới không được vượt quá 100 ký tự.' })
  newPassword!: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống.' })
  @IsString()
  @MinLength(6, {
    message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự.',
  })
  @MaxLength(100, {
    message: 'Xác nhận mật khẩu không được vượt quá 100 ký tự.',
  })
  confirmPassword!: string;
}
