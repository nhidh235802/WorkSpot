import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityType } from '../entities/cafe.entity';
import { OperatingHourDto } from './operating-hour.dto';

/** DTO chỉnh sửa thông tin quán — tất cả field đều optional */
export class UpdateCafeDto {
    /** Tên quán */
    @IsOptional()
    @IsString()
    name?: string;

    /** Mô tả quán */
    @IsOptional()
    @IsString()
    description?: string;

    /** Địa chỉ quán */
    @IsOptional()
    @IsString()
    address?: string;

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

    /**
     * Giờ hoạt động — nếu truyền vào thì toàn bộ giờ cũ sẽ bị xoá
     * và thay thế bằng danh sách mới (replace strategy)
     */
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OperatingHourDto)
    operatingHours?: OperatingHourDto[];
}
