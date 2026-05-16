import { FacilityType, RealtimeStatus } from '../entities/cafe.entity';
import { OperatingHourResponseDto } from './operating-hour.dto';
import { UserRole } from '../../users/entities/user.entity';

export class OwnerDto {
  id!: string;
  fullName!: string;
  avatar!: string | null;
  role!: UserRole;
}

export class ReviewUserDto {
  id!: string;
  fullName!: string;
  avatar!: string | null;
  jobTitle!: string;
}

export class ReviewDto {
  id!: string;
  rating!: number;
  comment!: string | null;
  images!: string[];
  createdAt!: Date;
  user!: ReviewUserDto | null;
}

export class CafeMetadataDto {
  averageRating!: number;
  reviewCount!: number;
  totalImages!: number;
}

export class CafeDetailResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  address!: string;
  latitude!: number | null;
  longitude!: number | null;
  images!: string[];
  facilities!: FacilityType[];
  realtimeStatus!: RealtimeStatus;
  owner!: OwnerDto | null;
  operatingHours!: OperatingHourResponseDto[];
  reviews!: ReviewDto[];
  metadata!: CafeMetadataDto;
}