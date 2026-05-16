import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cafe } from '../../cafes/entities/cafe.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  // 🛠️ SỬA ĐOẠN NÀY: Thêm nullable và default null để Postgres chấp nhận giá trị trống,
  // đồng thời khai báo kiểu dữ liệu 'string[] | null' để dập tắt hoàn toàn lỗi TS2769.
  @Column({ type: 'text', array: true, nullable: true, default: null })
  images?: string[] | null;

  // --- QUAN HỆ (RELATIONS) ---
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Cafe, (cafe) => cafe.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cafe_id' })
  cafe!: Cafe;

  // Thông tin về thời gian tạo và cập nhật đánh giá
  @CreateDateColumn()
  createdAt!: Date;
}