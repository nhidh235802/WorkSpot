import {
  IsInt,
  IsString,
  IsArray,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1, { message: 'Đánh giá sao tối thiểu là 1' })
  @Max(5, { message: 'Đánh giá sao tối đa là 5' })
  rating!: number;

  @IsString()
  @MinLength(20, { message: 'Nội dung đánh giá phải từ 20 ký tự trở lên' })
  @MaxLength(500, {
    message: 'Nội dung đánh giá không được vượt quá 500 ký tự',
  })
  comment!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Tối đa 10 ảnh' })
  @IsString({
    each: true,
    message: 'Mỗi phần tử phải là một chuỗi đường dẫn ảnh',
  }) // 🛠️ Thay đổi từ IsUrl thành IsString
  images?: string[];
}
