import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// Đây là file gom nhóm. Nó nói cho NestJS biết: "Trong hệ thống của tôi
// có một khu vực chuyên lo việc của User, gồm có Controller này và Service này".
// Thường file này cực kỳ ngắn. Cta chỉ cần khai báo Controller, UsersService và Entity vào đây.
// Lưu ý, để kết nối với Database, mình sẽ phải import TypeOrmModule.forFeature([User])
// để báo rằng khu vực này được phép đụng vào bảng users.
