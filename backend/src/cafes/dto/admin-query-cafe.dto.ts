import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CafeStatus } from '../entities/cafe.entity';

export class AdminQueryCafeDto {
  @IsOptional()
  @IsString()
  search?: string; // tìm theo name

  @IsOptional()
  @IsString()
  area?: string; // tìm theo address

  @IsOptional()
  @IsEnum(CafeStatus)
  status?: CafeStatus; // filter theo CafeStatus enum

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
