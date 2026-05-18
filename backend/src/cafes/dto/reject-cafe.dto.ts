import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectCafeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason!: string; // bắt buộc phải có lý do khi từ chối
}
