import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

/* Service là nơi chứa logic xử lý chính của ứng dụng. Controller sẽ gọi Service để lấy dữ liệu hoặc thực hiện các thao tác cần thiết, sau đó trả về kết quả cho Controller. */
/* Đại khái Service giống như Đầu bếp. Đầu bếp không quan tâm khách là ai, chỉ biết nhận yêu cầu từ bồi bàn (Controller), 
đi lấy nguyên liệu (gọi Database/TypeORM), xào nấu xử lý dữ liệu, rồi trả kết quả cho bồi bàn. */
/* Trong dự án thực tế, AppService gần như không có logic gì cả, nó chỉ trả về một chuỗi "Hello World!" để kiểm tra xem hệ thống có đang hoạt động hay không. 
Logic thực sự sẽ nằm ở các Service khác như: AuthService (xử lý đăng nhập, đăng ký), UsersService (xử lý CRUD người dùng), CafesService (xử lý CRUD quán cà phê)... */
// Code xử lý logic sẽ được code ở Service.
