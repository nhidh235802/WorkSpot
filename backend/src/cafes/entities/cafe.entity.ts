import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OperatingHour } from './operating-hour.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum CafeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Định nghĩa sẵn các tiện ích để lưu dạng mảng
export enum FacilityType {
  WIFI = 'wifi',
  SOCKET = 'socket',
  WORKSPACE = 'workspace',
  DESK = 'desk',
  SNACK = 'snack',
  CLEANLINESS = 'cleanliness',
  SMOKING_RULE = 'smoking_rule',
}

@Entity('cafes')
export class Cafe {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  // Lưu riêng kinh, vĩ độ cho hàm tính khoảng cách
  @Column({ type: 'float', nullable: true })
  latitude!: number;

  @Column({ type: 'float', nullable: true })
  longitude!: number;

  // Một ảnh đại diện và tối đa 10 ảnh quán
  @Column({ type: 'text', nullable: true })
  avatar!: string;

  @Column({ type: 'text', array: true, default: [] })
  images!: string[];

  // Các tiện ích của quán (wifi, ổ cắm, chỗ ngồi...)
  @Column({ type: 'enum', enum: FacilityType, array: true, default: [] })
  facilities!: FacilityType[];

  // Các trạng thái
  @Column({ type: 'boolean', default: false })
  isClosedOnHolidays!: boolean; // Nút tick "Đóng cửa vào ngày lễ"

  @Column({ type: 'enum', enum: CafeStatus, default: CafeStatus.PENDING })
  status!: CafeStatus;

  // Quan hệ với các bảng khác
  @OneToMany(() => OperatingHour, (operatingHour) => operatingHour.cafe, {
    cascade: true,
  })
  operatingHours!: OperatingHour[];

  @ManyToOne(() => User, (user) => user.cafes)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => Review, (review) => review.cafe)
  reviews!: Review[];

  // Thông tin về thời gian tạo và cập nhật quán
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
