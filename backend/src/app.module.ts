/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/module/users.module';
import { CafesModule } from './cafes/module/cafes.module';
import { ReviewsModule } from './reviews/module/reviews.module';
import { AuthModule } from './auth/module/auth.module';

@Module({
  imports: [
    // 1. Cấu hình biến môi trường
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Cấu hình kết nối PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    // 3. Các module tính năng của web app
    AuthModule,
    UsersModule,
    CafesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// Đây là Root Module. NestJS sẽ nhìn vào đây để biết dự án này có bao nhiêu khu vực nhỏ hơn.
// Mỗi khu vực nhỏ hơn sẽ được gọi là một Module. Ví dụ: AuthModule, UsersModule, CafesModule...
// Sau này, khi tạo thêm các module mới (như UsersModule, CafesModule), chúng ta bắt buộc phải "khai báo" chúng vào mảng imports ở file này để hệ thống nhận diện.
// Đại khái, ae có thể tưởng tượng Module Là nơi gom nhóm Bồi bàn và Đầu bếp lại với nhau.
// Ví dụ khu vực đồ uống (CafesModule) sẽ có bồi bàn riêng (cafes.controller) và đầu bếp pha chế riêng (cafes.service).
