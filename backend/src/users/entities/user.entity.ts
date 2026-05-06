// Đây là file Entity (Thực thể) dùng để định nghĩa cấu trúc bảng trong cơ sở dữ liệu PostgreSQL thông qua TypeORM.
// Hãy coi nó là một "Bản vẽ thiết kế" cho một bảng trong cơ sở dữ liệu, ví dụ: bảng users (người dùng), bảng cafes (quán cà phê)...
// Trong file này, chúng ta sẽ định nghĩa các trường thông tin cần thiết cho bảng users, ví dụ: id, email, password, name...
// File này sẽ được TypeORM sử dụng để tự động tạo ra bảng users trong cơ sở dữ liệu PostgreSQL khi chạy Migration (di cư cơ sở dữ liệu).

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cafe } from '../../cafes/entities/cafe.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'text', nullable: true })
  avatar!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  // Mặc định tạo tài khoản mới sẽ là Khách hàng
  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  // --- QUAN HỆ (RELATIONS) ---

  @OneToMany(() => Cafe, (cafe) => cafe.owner)
  cafes!: Cafe[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  // Thông tin về thời gian tạo và cập nhật tài khoản
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
