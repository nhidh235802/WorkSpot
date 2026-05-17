import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityType } from '../entities/cafe.entity';
import { OperatingHourDto } from './operating-hour.dto';

// --- DTO CHÍNH cho cập nhật quán ---
export class UpdateCafeDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên quán không được để trống' })
  @MaxLength(50, { message: 'Tên quán không được vượt quá 50 ký tự' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(100, { message: 'Địa chỉ không được vượt quá 100 ký tự' })
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MaxLength(300, { message: 'Mô tả không được vượt quá 300 ký tự' })
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Danh sách tiện ích
  @IsArray()
  @IsEnum(FacilityType, { each: true, message: 'Có tiện ích không hợp lệ' })
  @IsOptional()
  facilities?: FacilityType[];

  @IsBoolean()
  @IsOptional()
  isClosedOnHolidays?: boolean;

  // Giờ hoạt động (mảng theo từng ngày)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours?: OperatingHourDto[];

  // Danh sách URL ảnh (được Controller thêm vào sau khi Multer xử lý)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
