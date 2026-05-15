import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
//import { config } from 'dotenv';

//config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'workspot_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});

// Đây là file cấu hình kết nối đến cơ sở dữ liệu PostgreSQL bằng TypeORM, không phải file của NestJS.
// Mục đích của file này là để tạo ra một DataSource (nguồn dữ liệu) mà sau này chúng ta sẽ dùng để chạy các lệnh Migration (di cư cơ sở dữ liệu) hoặc Seed (tạo dữ liệu mẫu) thông qua CLI của TypeORM.
// Chúng ta sẽ không import file này vào bất kỳ đâu trong NestJS cả, nó chỉ dùng để chạy các lệnh Migration hoặc Seed mà thôi.
