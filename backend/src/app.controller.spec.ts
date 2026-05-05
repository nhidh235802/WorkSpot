import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { beforeEach, describe, expect, it } from '@jest/globals';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

// Chữ .spec. có nghĩa là Specification/Testing. Các file .spec dùng để viết Unit Test (kiểm thử tự động) cho file ts tương ứng.
// Trong dự án thực tế, chúng ta sẽ không viết Unit Test cho AppController vì nó gần như không có logic gì cả.
// Unit Test thường được viết cho các file có nhiều logic hơn như: AuthService (xử lý đăng nhập, đăng ký), UsersService (xử lý CRUD người dùng), CafesService (xử lý CRUD quán cà phê)...
// Mục đích của Unit Test là để tự động kiểm tra xem các hàm trong file đó có trả về kết quả đúng như mong đợi hay không.
