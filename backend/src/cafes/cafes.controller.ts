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
import { CafesService } from './cafes.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { CafeDetailResponseDto } from './dto/cafe-detail-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Cafe, CafeStatus } from './entities/cafe.entity';

import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SearchCafeDto } from './dto/search-cafe.dto';
import { RealtimeStatus } from './entities/cafe.entity';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCafeDto: CreateCafeDto): Promise<CafeDetailResponseDto> {
    return this.cafesService.create(createCafeDto);
  }

  @Get('search')
  searchCafes(@Query() searchCafeDto: SearchCafeDto) {
    return this.cafesService.searchCafes(searchCafeDto);
  }

  // 1. ĐÃ SỬA: Lấy danh sách quán của Owner (Bảo mật bằng Token)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('owner/me')
  async getMyCafes(@Req() req: { user: { id: string } }) {
    // Lấy ID từ token, bỏ qua Query param
    return this.cafesService.getCafesByOwner(req.user.id);
  }

  // 2. ĐÃ SỬA: Cập nhật trạng thái realtime (Bảo mật bằng Token)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/realtime-status')
  async updateRealtimeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('realtimeStatus') realtimeStatus: RealtimeStatus,
    @Req() req: { user: { id: string } },
  ) {
    // Lấy ID từ token, bỏ qua Body param
    return this.cafesService.updateRealtimeStatus(id, realtimeStatus, req.user.id);
  }

// ─── REVIEWS ────────────────────────────────────────────────────────────────

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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCafeDto: UpdateCafeDto,
    @Req() req: { user: { id: string } },
  ): Promise<CafeDetailResponseDto> {
    return this.cafesService.update(id, updateCafeDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  patchStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: CafeStatus,
  ): Promise<CafeDetailResponseDto> {
    return this.cafesService.patchStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cafesService.remove(id);
  }
}