import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseFloatPipe,
  Req,
} from '@nestjs/common';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

import { CafesService } from './cafes.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { CafeDetailResponseDto } from './dto/cafe-detail-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CafeStatus } from './entities/cafe.entity';

import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SearchCafeDto } from './dto/search-cafe.dto';
import { RealtimeStatus } from './entities/cafe.entity';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

import { AdminQueryCafeDto } from './dto/admin-query-cafe.dto';
import { RejectCafeDto } from './dto/reject-cafe.dto';

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  // API Route: GET http://localhost:3001/cafes/recommended?lat=...&lng=...
  @Get('recommended')
  async getRecommended(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.cafesService.getRecommended(lat, lng);
  }

  // GET /cafes/admin?search=&status=pending&page=1&limit=10
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin(@Query() query: AdminQueryCafeDto) {
    return this.cafesService.findAllForAdmin(query);
  }

  // GET /cafes/admin/pending  → trang 情報の承認
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    // Dùng lại findAllForAdmin với filter status=pending
    return this.cafesService.findAllForAdmin({
      status: CafeStatus.PENDING,
      limit: 100,
    });
  }

  // PATCH /cafes/:id/approve  → gọi patchStatus đã có
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.cafesService.patchStatus(id, CafeStatus.APPROVED);
  }

  // PATCH /cafes/:id/reject   → gọi patchStatus đã có
  // Body: { "rejectionReason": "Thông tin không đầy đủ" }
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RejectCafeDto) {
    return this.cafesService.patchStatus(
      id,
      CafeStatus.REJECTED,
      dto.rejectionReason,
    );
  }

  // PATCH /cafes/:id/visibility  → toggle APPROVED ↔ HIDDEN
  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleVisibility(@Param('id', ParseUUIDPipe) id: string) {
    return this.cafesService.toggleVisibility(id);
  }

  // API Route: POST http://localhost:3001/cafes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: './src/uploads/cafe-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận ảnh JPEG hoặc PNG.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async create(
    @Body('data') dataString: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: { user: { id: string } },
  ) {
    // 1. Dịch chuỗi văn bản thành Object thông thường
    const rawData = JSON.parse(dataString);

    // 2. BIẾN HÌNH: Ép Object thông thường đó vào khuôn mẫu của CreateCafeDto
    const createCafeDto = plainToInstance(CreateCafeDto, rawData);

    // 3. KÍCH HOẠT DTO: Chạy các luật kiểm tra (@IsNotEmpty, @MaxLength...)
    const errors = await validate(createCafeDto);
    if (errors.length > 0) {
      // Nếu có lỗi (ví dụ: tên quá 50 ký tự), lập tức ném lỗi 400 đá văng request
      throw new BadRequestException(
        'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!',
      );
    }

    // 4. Kiểm tra số lượng ảnh bắt buộc (1-5)
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Vui lòng tải lên ít nhất 1 hình ảnh của quán.',
      );
    }
    if (files.length > 5) {
      throw new BadRequestException('Chỉ được tải lên tối đa 5 ảnh.');
    }

    // 5. Mọi thứ đã an toàn, gán link ảnh và gọi Service
    createCafeDto.images = files.map(
      (f) => `/uploads/cafe-images/${f.filename}`,
    );

    return this.cafesService.create(createCafeDto, req.user.id);
  }

  @Get('search')
  searchCafes(@Query() searchCafeDto: SearchCafeDto) {
    return this.cafesService.searchCafes(searchCafeDto);
  }

  // 1. Lấy danh sách quán của Owner (Bảo mật bằng Token)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('owner/me')
  async getMyCafes(@Req() req: { user: { id: string } }) {
    // Lấy ID từ token, bỏ qua Query param
    return this.cafesService.getCafesByOwner(req.user.id);
  }

  // 2. Cập nhật trạng thái realtime (Bảo mật bằng Token)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/realtime-status')
  async updateRealtimeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('realtimeStatus') realtimeStatus: RealtimeStatus,
    @Req() req: { user: { id: string } },
  ) {
    // Lấy ID từ token, bỏ qua Body param
    return this.cafesService.updateRealtimeStatus(
      id,
      realtimeStatus,
      req.user.id,
    );
  }

  // POST /cafes/:id/reviews  →  Đăng đánh giá (chỉ WORKER/CUSTOMER đã đăng nhập)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  createReview(
    @Param('id', ParseUUIDPipe) cafeId: string,
    @Body() body: CreateReviewDto,
    @Req() req: { user: { id: string } },
  ) {
    // userId lấy từ JWT, không tin body
    return this.cafesService.createReview(cafeId, body, req.user.id);
  }

  // GET /cafes/:id/reviews  →  Lấy danh sách review của quán (public, sort mới nhất)
  @Get(':id/reviews')
  getReviews(@Param('id', ParseUUIDPipe) cafeId: string) {
    return this.cafesService.getReviews(cafeId);
  }

  // DELETE /cafes/:cafeId/reviews/:reviewId  →  Xoá review (chỉ chủ review)
  @UseGuards(JwtAuthGuard)
  @Delete(':id/reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeReview(
    @Param('id', ParseUUIDPipe) cafeId: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    return this.cafesService.removeReview(cafeId, reviewId, req.user.id);
  }

  // ────────────────────────────────────────────────────────────────────────────

  // HÀM FIND ONE PHẢI NẰM DƯỚI HÀM SEARCH VÀ OWNER/ME
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CafeDetailResponseDto> {
    return this.cafesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: './src/uploads/cafe-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận ảnh JPEG hoặc PNG.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('data') dataString: string,
    @UploadedFiles() newFiles: Express.Multer.File[],
    @Req() req: { user: { id: string } },
  ): Promise<CafeDetailResponseDto> {
    // Parse JSON payload
    const rawData = dataString ? JSON.parse(dataString) : {};
    const updateCafeDto = plainToInstance(UpdateCafeDto, rawData);

    // Validate
    const errors = await validate(updateCafeDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!',
      );
    }

    // Gộp ảnh mới (nếu có) vào danh sách ảnh cũ được giữ lại
    if (newFiles && newFiles.length > 0) {
      const newImageUrls = newFiles.map(
        (f) => `/uploads/cafe-images/${f.filename}`,
      );
      // existingImages là mảng URL cũ mà frontend muốn giữ lại
      const existingImages: string[] = updateCafeDto.images || [];
      updateCafeDto.images = [...existingImages, ...newImageUrls];
    }

    return this.cafesService.update(id, updateCafeDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  patchStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: CafeStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ): Promise<CafeDetailResponseDto> {
    return this.cafesService.patchStatus(id, status, rejectionReason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cafesService.remove(id);
  }
}
