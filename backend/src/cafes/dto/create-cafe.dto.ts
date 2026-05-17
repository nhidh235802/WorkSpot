import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityType } from '../entities/cafe.entity';
import { OperatingHourDto } from './operating-hour.dto';

export class CreateCafeDto {
  /** Tên quán (bắt buộc, tối đa 50 ký tự) */
  @IsString()
  @IsNotEmpty({ message: 'Tên quán không được để trống' })
  @MaxLength(50, { message: 'Tên quán không được vượt quá 50 ký tự' })
  name!: string;

  /** Mô tả quán (bắt buộc, tối đa 300 ký tự) */
  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MaxLength(300, { message: 'Mô tả không được vượt quá 300 ký tự' })
  description!: string;

  /** Địa chỉ (bắt buộc, tối đa 100 ký tự) */
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(100, { message: 'Địa chỉ không được vượt quá 100 ký tự' })
  address!: string;

  /** Vĩ độ */
  @IsOptional()
  @IsNumber()
  latitude?: number;

  /** Kinh độ */
  @IsOptional()
  @IsNumber()
  longitude?: number;

  /** Ảnh đại diện (URL) */
  @IsOptional()
  @IsString()
  avatar?: string;

  /** Danh sách ảnh quán (mảng URL) — được Controller thêm vào sau khi Multer lưu ảnh */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  /** Các tiện ích của quán */
  @IsOptional()
  @IsArray()
  @IsEnum(FacilityType, { each: true })
  facilities?: FacilityType[];

  /** Đóng cửa vào ngày lễ */
  @IsOptional()
  @IsBoolean()
  isClosedOnHolidays?: boolean;

  /** UUID của chủ quán — được Controller inject từ JWT token */
  @IsOptional()
  @IsString()
  ownerId?: string;

  /** Giờ hoạt động (mảng theo từng ngày) */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours?: OperatingHourDto[];
}
