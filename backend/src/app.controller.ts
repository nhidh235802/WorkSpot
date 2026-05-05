import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

/* Controller nhận HTTP Request từ Frontend như GET, POST), sau đó gọi AppService để xử lý logic và trả về HTTP Response cho Frontend.*/

/* Trong các dự án thực tế, người ta GẦN NHƯ KHÔNG CODE GÌ vào đây cả, 
hoặc biến nó thành một API kiểm tra sức khỏe hệ thống (Health Check). 
Ví dụ: Mình có thể sửa 'Hello World' thành trả về câu "Welcome to WorkSpot API - Server is running!" 
để Frontend ping thử xem Backend có đang sống hay không. */

// Chúng ta sẽ làm việc với controller các khu vực nhỏ hơn.

// Đại khái Controller giống như Bồi bàn. Bồi bàn sẽ đứng ở quầy, nhận order (chính là DTO) từ khách (HTTP Request),
// rồi đi đến nhà bếp (Service) để truyền đạt lại yêu cầu,
// sau khi nhà bếp làm xong thì bồi bàn sẽ mang đồ ăn (HTTP Response) trả lại cho khách.

// Tuyệt đối không viết code xử lý dữ liệu phức tạp ở Controller. Chỉ dùng dùng các "cờ" như @Get(), @Post(), @Body().
