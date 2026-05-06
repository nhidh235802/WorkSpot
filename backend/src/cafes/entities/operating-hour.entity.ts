import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cafe } from './cafe.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('operating_hours')
export class OperatingHour {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek!: DayOfWeek;

  @Column({ type: 'varchar', length: 5, nullable: true })
  openTime!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  closeTime!: string;

  @Column({ type: 'boolean', default: false })
  isDayOff!: boolean;

  // --- QUAN HỆ (RELATION) ---
  @ManyToOne(() => Cafe, (cafe) => cafe.operatingHours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cafe_id' })
  cafe!: Cafe;
}

/* [
  { "day": "monday", "open": "08:00", "close": "22:00", "isOff": false },
  { "day": "tuesday", "open": "08:00", "close": "22:00", "isOff": false }
] */
