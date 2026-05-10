import { DayOfWeek } from '../entities/operating-hour.entity';

export class OperatingHourDto {
  dayOfWeek!: DayOfWeek;
  openTime!: string | null;
  closeTime!: string | null;
  isDayOff!: boolean;
}