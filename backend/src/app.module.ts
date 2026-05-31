import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CafesModule } from './cafes/cafes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    // 1. Cấu hình biến môi trường
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Cấu hình kết nối PostgreSQL (Supabase)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    // 3. Supabase Storage (dùng chung toàn app)
    SupabaseModule,

    // 4. Các module tính năng của web app
    AuthModule,
    UsersModule,
    CafesModule,
    ReviewsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

