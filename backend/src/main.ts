import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// file chạy đầu tiên nhất khi bạn gõ npm run start:dev
// Mục đích của file này là để khởi tạo NestJS app và lắng nghe trên một cổng nhất định (mặc định là 3000)
// Thường chỉ thêm cấu hình chung toàn cục (Global) như: Cài đặt CORS (cho phép Frontend Next.js gọi API), cài đặt Validation Pipe (bộ lọc dữ liệu), hoặc thiết lập Swagger (tài liệu API).
