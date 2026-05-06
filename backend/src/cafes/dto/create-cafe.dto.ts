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
import { DayOfWeek } from '../entities/operating-hour.entity';

export class CreateOperatingHourDto {
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;
}

export class CreateCafeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(FacilityType, { each: true })
  facilities?: FacilityType[];

  @IsOptional()
  @IsBoolean()
  isClosedOnHolidays?: boolean;

  @IsUUID()
  ownerId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOperatingHourDto)
  operatingHours?: CreateOperatingHourDto[];
}
