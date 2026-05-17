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
  HIDDEN = 'hidden',
}

// BỔ SUNG: Enum cho trạng thái hoạt động theo thời gian thực
export enum RealtimeStatus {
  AVAILABLE = 'available',
  NORMAL = 'normal',
  BUSY = 'busy',
}

export enum FacilityType {
  WIFI = 'wifi',
  SOCKET = 'socket',
  WORKSPACE = 'workspace',
  DESK = 'desk',
  SNACK = 'snack',
  FLEXIBLE_HOURS = 'flexible_hours',
  CLEANLINESS = 'cleanliness',
  SMOKING_RULE = 'smoking_rule',
}

@Entity('cafes')
export class Cafe {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'float', nullable: true })
  latitude!: number;

  @Column({ type: 'float', nullable: true })
  longitude!: number;

  @Column({ type: 'text', nullable: true })
  avatar!: string;

  @Column({ type: 'text', array: true, default: [] })
  images!: string[];

  @Column({ type: 'enum', enum: FacilityType, array: true, default: [] })
  facilities!: FacilityType[];

  @Column({ type: 'boolean', default: false })
  isClosedOnHolidays!: boolean;

  @Column({ type: 'enum', enum: CafeStatus, default: CafeStatus.PENDING })
  status!: CafeStatus;

  /** Dữ liệu chờ duyệt (lưu snapshot khi Owner sửa - chưa được duyệt) */
  @Column({ type: 'jsonb', nullable: true })
  pendingData!: any;

  // LÝ DO TỪ CHỐI (Dành cho Admin)
  @Column({ type: 'text', nullable: true })
  rejectionReason!: string;

  // TRẠNG THÁI REALTIME (Dành cho Owner báo cáo Đang đông / Còn chỗ)
  @Column({
    type: 'enum',
    enum: RealtimeStatus,
    default: RealtimeStatus.NORMAL,
  })
  realtimeStatus!: RealtimeStatus;

  @OneToMany(() => OperatingHour, (operatingHour) => operatingHour.cafe, {
    cascade: true,
  })
  operatingHours!: OperatingHour[];

  @ManyToOne(() => User, (user) => user.cafes)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => Review, (review) => review.cafe)
  reviews!: Review[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
