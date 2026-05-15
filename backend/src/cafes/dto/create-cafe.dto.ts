import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityType } from '../entities/cafe.entity';
import { OperatingHourDto } from './operating-hour.dto';

export class CreateCafeDto {
  /** Tên quán */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Mô tả quán */
  @IsOptional()
  @IsString()
  description?: string;

  /** Địa chỉ */
  @IsString()
  @IsNotEmpty()
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

  /** Danh sách ảnh quán (mảng URL) */
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

  /** UUID của chủ quán */
  @IsUUID()
  ownerId!: string;

  /** Giờ hoạt động */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours?: OperatingHourDto[];
}
