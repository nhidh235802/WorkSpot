// Đây là file DTO (Data Transfer Object) dùng để định nghĩa cấu trúc dữ liệu khi tạo mới một người dùng (Create User).
// Hãy coi nó là một "Tờ phiếu điền thông tin" mà Frontend (Next.js) gửi xuống.
// Trong file này, chúng ta sẽ định nghĩa các trường thông tin cần thiết để tạo mới một người dùng, ví dụ: email, password, name...
/* Để bảo vệ hệ thống. Ví dụ, người dùng đăng ký tài khoản cần gửi email và password. 
DTO sẽ kiểm tra xem email có đúng định dạng @gmail.com không, password có đủ 8 ký tự không. 
Nếu sai, nó vứt cái phiếu đó đi luôn, báo lỗi về Frontend, không thèm gọi Đầu bếp.*/
// File này code định nghĩa các trường dữ liệu và gắn "bùa" kiểm tra (Validator). Ví dụ: @IsEmail(), @IsNotEmpty(), @MinLength(8).

import { IsEmail, MinLength, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email!: string;

  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password!: string;
}
