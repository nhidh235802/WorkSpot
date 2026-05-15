import { IsBoolean, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { DayOfWeek } from '../entities/operating-hour.entity';

/** Định dạng giờ hợp lệ: HH:mm (00:00 – 23:59) */
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Request DTO (dùng cho Create / Update) ─────────────────────────────────

export class OperatingHourDto {
  /** Ngày trong tuần */
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  /** Giờ mở cửa — định dạng HH:mm (ví dụ: "08:00") */
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'openTime phải có định dạng HH:mm' })
  openTime?: string | null;

  /** Giờ đóng cửa — định dạng HH:mm (ví dụ: "22:00") */
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'closeTime phải có định dạng HH:mm' })
  closeTime?: string | null;

  /** Ngày nghỉ (true = không mở cửa ngày này) */
  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;
}

// ─── Response DTO (dùng cho CafeDetailResponseDto) ──────────────────────────

export class OperatingHourResponseDto {
  dayOfWeek!: DayOfWeek;
  openTime!: string | null;
  closeTime!: string | null;
  isDayOff!: boolean;
}