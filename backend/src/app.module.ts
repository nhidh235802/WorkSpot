import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CafesModule } from './cafes/cafes.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
