import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cafe, CafeStatus, RealtimeStatus } from './entities/cafe.entity';
import { OperatingHour } from './entities/operating-hour.entity';

import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';

import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { CafeDetailResponseDto } from './dto/cafe-detail-response.dto';
import { SearchCafeDto } from './dto/search-cafe.dto';

import { CreateReviewDto } from './dto/create-review.dto';
import { MailService } from '../mail/mail.service';

function removeVietnameseTones(str: string): string {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

@Injectable()
export class CafesService {
  constructor(
    @InjectRepository(Cafe)
    private readonly cafesRepository: Repository<Cafe>,

    @InjectRepository(OperatingHour)
    private readonly operatingHoursRepository: Repository<OperatingHour>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly mailService: MailService,
  ) {}

  async getRecommended(userLat: number, userLng: number): Promise<any[]> {
    const maxDist = 10;

    const haversineExpr = [
      '(6371 * acos(',
      '  LEAST(1, cos(radians(:lat)) * cos(radians(cafe.latitude))',
      '  * cos(radians(cafe.longitude) - radians(:lng))',
      '  + sin(radians(:lat)) * sin(radians(cafe.latitude)))',
      '))',
    ].join('');

    const avgRatingExpr = 'COALESCE(AVG(review.rating), 0)';

    const scoreExpr = [
      '((GREATEST(0, :maxDist - ',
      haversineExpr,
      ') / :maxDist) * 60)',
      ` + ((${avgRatingExpr} / 5) * 40)`,
    ].join('');

    const result: { entities: Cafe[]; raw: any[] } = await this.cafesRepository
      .createQueryBuilder('cafe')
      .leftJoin('cafe.reviews', 'review')
      .where('cafe.status = :status', {
        status: CafeStatus.APPROVED,
      })
      .groupBy('cafe.id')
      .addSelect(haversineExpr, 'distance')
      .addSelect(avgRatingExpr, 'avg_rating')
      .addSelect(scoreExpr, 'total_score')
      .orderBy(scoreExpr, 'DESC')
      .limit(6)
      .setParameters({
        lat: userLat,
        lng: userLng,
        maxDist,
      })
      .getRawAndEntities();

    return result.entities.map((entity, index) => {
      const rawItem = result.raw[index] as {
        avg_rating: number;
        distance: number;
      };

      return {
        ...entity,
        rating: Math.round(rawItem.avg_rating * 10) / 10,
        distance: Math.round(rawItem.distance * 10) / 10,
      };
    });
  }

  async create(
    createCafeDto: CreateCafeDto,
    ownerId: string,
  ): Promise<CafeDetailResponseDto> {
    if (createCafeDto.address) {
      createCafeDto.address = removeVietnameseTones(createCafeDto.address);
    }
    const { operatingHours, ...cafeData } = createCafeDto;

    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException(`Người dùng #${ownerId} không tìm thấy`);
    }

    const cafe = this.cafesRepository.create({
      ...cafeData,
      // Avatar luôn là ảnh đầu tiên trong mảng images (thứ tự do người dùng upload)
      avatar: cafeData.images?.[0] ?? undefined,
      owner,
      status: CafeStatus.PENDING, // Mới đăng ký → Chờ duyệt
    });

    const savedCafe = await this.cafesRepository.save(cafe);

    if (operatingHours?.length) {
      const hours = operatingHours.map((h) =>
        this.operatingHoursRepository.create({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime ?? undefined,
          closeTime: h.closeTime ?? undefined,
          isDayOff: h.isDayOff,
          cafe: savedCafe,
        }),
      );

      await this.operatingHoursRepository.save(hours);
    }

    return this.findOne(savedCafe.id);
  }

  private async findOneEntity(id: string): Promise<Cafe> {
    const cafe = await this.cafesRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        operatingHours: true,
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Quán cà phê ${id} không tìm thấy`);
    }

    return cafe;
  }

  async findOne(id: string): Promise<CafeDetailResponseDto> {
    const cafe = await this.cafesRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        operatingHours: true,
        reviews: {
          user: true,
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Quán cà phê ${id} không tìm thấy`);
    }

    const reviews = cafe.reviews || [];
    const operatingHours = cafe.operatingHours || [];

    const reviewCount = reviews.length;

    const averageRating =
      reviewCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            ).toFixed(1),
          )
        : 0;

    return {
      id: cafe.id,
      name: cafe.name,
      description: cafe.description,
      address: cafe.address,
      latitude: cafe.latitude ?? null,
      longitude: cafe.longitude ?? null,

      images: cafe.images || [],
      facilities: cafe.facilities || [],
      realtimeStatus: cafe.realtimeStatus,
      status: cafe.status,
      pendingData: cafe.pendingData,

      owner: cafe.owner
        ? {
            id: cafe.owner.id,
            fullName: cafe.owner.fullName,
            avatar: cafe.owner.avatar,
            role: cafe.owner.role,
          }
        : null,

      operatingHours: operatingHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isDayOff: oh.isDayOff,
      })),

      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        images: review.images || [],
        createdAt: review.createdAt,

        user: review.user
          ? {
              id: review.user.id,
              fullName: review.user.fullName,
              avatar: review.user.avatar,
              jobTitle: review.user.bio || 'Người dùng WorkSpot',
            }
          : null,
      })),

      metadata: {
        averageRating,
        reviewCount,
        totalImages: cafe.images?.length || 0,
      },
    };
  }

  async update(
    id: string,
    updateDto: UpdateCafeDto,
    requesterId: string,
  ): Promise<CafeDetailResponseDto> {
    const cafe = await this.findOneEntity(id);

    if (cafe.owner.id !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa quán này');
    }

    if (updateDto.address) {
      updateDto.address = removeVietnameseTones(updateDto.address);
    }

    const { operatingHours, ...cafeData } = updateDto;

    const updatedCafe = await this.cafesRepository.manager.transaction(
      async (manager) => {
        // 1. Snapshot giờ hoạt động mới vào pendingData (không ghi vào bảng operating_hours ngay)
        const pendingHours =
          operatingHours !== undefined ? operatingHours : undefined;

        // 2. Lưu toàn bộ thay đổi vào pendingData (JSON snapshot)
        //    Bản ghi chính (name, address, images...) KHÔNG bị thay đổi
        //    → Public user vẫn thấy dữ liệu cũ đã được duyệt
        cafe.pendingData = {
          ...cafeData,
          ...(pendingHours !== undefined && { operatingHours: pendingHours }),
          submittedAt: new Date().toISOString(),
        };

        // 3. Chỉ reset status về PENDING
        cafe.status = CafeStatus.PENDING;

        return manager.save(Cafe, cafe);
      },
    );

    return this.findOne(updatedCafe.id);
  }

  async remove(id: string): Promise<void> {
    const cafe = await this.findOneEntity(id);
    await this.cafesRepository.remove(cafe);
  }

  async getCafesByOwner(ownerId: string): Promise<any[]> {
    const cafes = await this.cafesRepository.find({
      where: {
        owner: { id: ownerId },
      },
      relations: {
        reviews: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return cafes.map((cafe) => {
      const reviewCount = cafe.reviews?.length || 0;

      const averageRating =
        reviewCount > 0
          ? Number(
              (
                cafe.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              ).toFixed(1),
            )
          : null;

      // Ảnh đại diện: ưu tiên images[0] (ảnh đầu tiên theo thứ tự upload)
      const thumbnail =
        cafe.images?.[0] ||
        cafe.avatar ||
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400';

      return {
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        image: thumbnail,
        status: cafe.status,
        realtimeStatus: cafe.realtimeStatus,
        rejectionReason: cafe.rejectionReason ?? null,
        updatedAt: cafe.updatedAt,
        rating: averageRating,
      };
    });
  }

  async updateRealtimeStatus(
    id: string,
    realtimeStatus: RealtimeStatus,
    ownerId: string,
  ) {
    const cafe = await this.findOneEntity(id);

    if (cafe.owner.id !== ownerId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật quán của người khác',
      );
    }

    cafe.realtimeStatus = realtimeStatus;

    await this.cafesRepository.save(cafe);

    return {
      message: 'Cập nhật trạng thái thành công',
      realtimeStatus: cafe.realtimeStatus,
    };
  }

  async patchStatus(
    id: string,
    status: CafeStatus,
    rejectionReason?: string,
  ): Promise<CafeDetailResponseDto> {
    const cafe = await this.findOneEntity(id);

    if (status === CafeStatus.APPROVED && cafe.pendingData) {
      // ─── Admin DUYỆT: áp dụng dữ liệu từ pendingData lên bản ghi chính ───
      const {
        operatingHours: pendingHours,
        submittedAt,
        ...pendingFields
      } = cafe.pendingData;

      // Ghi đè các field cơ bản
      Object.assign(cafe, pendingFields);

      // Đồng bộ avatar với ảnh đầu tiên nếu images thay đổi
      if (pendingFields.images?.length) {
        cafe.avatar = pendingFields.images[0];
      }

      // Áp dụng giờ hoạt động nếu có
      if (pendingHours?.length) {
        await this.operatingHoursRepository.delete({ cafe: { id } });
        const hours = pendingHours.map((h: any) =>
          this.operatingHoursRepository.create({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime ?? undefined,
            closeTime: h.closeTime ?? undefined,
            isDayOff: h.isDayOff ?? false,
            cafe,
          }),
        );
        await this.operatingHoursRepository.save(hours);
      }

      // Xóa snapshot sau khi đã áp dụng
      cafe.pendingData = null;
    } else if (status === CafeStatus.REJECTED) {
      // ─── Admin TỪ CHỐI: chỉ ghi lý do, xóa snapshot, giữ nguyên dữ liệu cũ ───
      cafe.pendingData = null;
      if (rejectionReason !== undefined) cafe.rejectionReason = rejectionReason;
    }

    cafe.status = status;

    const saved = await this.cafesRepository.save(cafe);

    return this.findOne(saved.id);
  }

  async searchCafes(query: SearchCafeDto): Promise<any[]> {
    const { lat, lng, radius, keyword } = query;

    const distanceSql = [
      '(6371 * acos(',
      '  LEAST(1, cos(radians(:searchLat)) * cos(radians(cafe.latitude))',
      '  * cos(radians(cafe.longitude) - radians(:searchLng))',
      '  + sin(radians(:searchLat)) * sin(radians(cafe.latitude)))',
      '))',
    ].join('');

    const avgRatingExpr = 'COALESCE(AVG(review.rating), 0)';

    const queryBuilder = this.cafesRepository
      .createQueryBuilder('cafe')
      .leftJoin('cafe.reviews', 'review')
      .where('cafe.status = :status', {
        status: 'approved',
      })
      .groupBy('cafe.id')
      .addSelect(distanceSql, 'distance')
      .addSelect(avgRatingExpr, 'avg_rating')
      .setParameters({
        searchLat: lat,
        searchLng: lng,
      });

    if (keyword) {
      queryBuilder.andWhere(
        '(cafe.name ILIKE :keyword OR cafe.address ILIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    const filterMapping: Record<string, string> = {
      hasWifi: 'wifi',
      hasPower: 'socket',
      hasDesk: 'desk',
      hasSnacks: 'snack',
      isClean: 'cleanliness',
      isFocusFriendly: 'workspace',
      allowsSmoking: 'smoking_rule',
      hasFlexibleHours: 'flexible_hours',
    };

    let filterIndex = 0;

    for (const key of Object.keys(filterMapping)) {
      if (query[key as keyof SearchCafeDto] === true) {
        const paramName = `facility${filterIndex++}`;

        queryBuilder.andWhere(
          `cafe.facilities @> ARRAY[:${paramName}]::public.cafes_facilities_enum[]`,
          {
            [paramName]: filterMapping[key],
          },
        );
      }
    }

    if (!keyword) {
      const effectiveRadius = radius ?? 5;

      queryBuilder.having(`${distanceSql} <= :radius`, {
        radius: effectiveRadius,
      });
    }

    queryBuilder.orderBy(distanceSql, 'ASC');

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    return entities.map((entity, i) => ({
      ...entity,
      distance: Math.round(raw[i].distance * 10) / 10,
      rating: Math.round(raw[i].avg_rating * 10) / 10,
    }));
  }

  // ─── REVIEWS ─────────────────────────────────────────────

  async createReview(
    cafeId: string,
    dto: CreateReviewDto,
    userId: string,
  ): Promise<any> {
    const cafe = await this.cafesRepository.findOne({
      where: { id: cafeId },
    });

    if (!cafe) {
      throw new NotFoundException(`Không tìm thấy quán #${cafeId}`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
    }

    // Nếu dto.images có phần tử thì lấy, nếu không hoặc trống thì gán là null
    // (Postgres sẽ hiểu đây là giá trị trống của cột array)
    const reviewImages =
      dto.images && dto.images.length > 0 ? dto.images : null;

    // Sử dụng ép kiểu rõ ràng (as any) hoặc truyền thẳng để TypeORM không hiểu nhầm sang mảng Entity
    const review = this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      images: reviewImages,
      cafe,
      user,
    });

    const saved = await this.reviewRepository.save(review);

    return {
      id: saved.id,
      rating: saved.rating,
      comment: saved.comment,
      images: saved.images ?? [], // Trả về mảng rỗng cho Frontend dễ map giao diện
      createdAt: saved.createdAt,

      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar ?? null,
        jobTitle: user.bio || 'Người dùng WorkSpot',
      },
    };
  }

  async getReviews(cafeId: string): Promise<any[]> {
    const cafe = await this.cafesRepository.findOne({
      where: { id: cafeId },
    });

    if (!cafe) {
      throw new NotFoundException(`Không tìm thấy quán #${cafeId}`);
    }

    const reviews = await this.reviewRepository.find({
      where: {
        cafe: { id: cafeId },
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      images: r.images ?? [],
      createdAt: r.createdAt,

      user: r.user
        ? {
            id: r.user.id,
            fullName: r.user.fullName,
            avatar: r.user.avatar ?? null,
            jobTitle: r.user.bio || 'Người dùng WorkSpot',
          }
        : null,
    }));
  }

  async removeReview(
    cafeId: string,
    reviewId: string,
    requesterId: string,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
        cafe: { id: cafeId },
      },
      relations: {
        user: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá #${reviewId}`);
    }

    if (review.user.id !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xoá đánh giá này');
    }

    await this.reviewRepository.remove(review);
  }
  // ── Admin: danh sách tất cả cafe có filter + phân trang ──────────────
  async findAllForAdmin(query: {
    search?: string;
    status?: CafeStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 10 } = query;

    const qb = this.cafesRepository
      .createQueryBuilder('cafe')
      .leftJoinAndSelect('cafe.owner', 'owner')
      .leftJoin('cafe.reviews', 'review')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avg_rating')
      .addSelect('COUNT(review.id)', 'review_count')
      .groupBy('cafe.id')
      .addGroupBy('owner.id');

    if (search) {
      qb.andWhere('(cafe.name ILIKE :search OR cafe.address ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('cafe.status = :status', { status });
    } else {
      qb.andWhere('cafe.status != :pendingStatus', { pendingStatus: CafeStatus.PENDING });
    }

    qb.orderBy('cafe.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    // Đếm riêng để lấy total (không bị ảnh hưởng bởi skip/take)
    const total = await this.cafesRepository.count({
      where: status ? { status } : [
        { status: CafeStatus.APPROVED },
        { status: CafeStatus.REJECTED },
        { status: CafeStatus.HIDDEN },
      ],
    });

    const items = entities.map((cafe, i) => ({
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      avatar: cafe.avatar,
      status: cafe.status,
      realtimeStatus: cafe.realtimeStatus,
      facilities: cafe.facilities,
      rejectionReason: cafe.rejectionReason ?? null,
      hasPendingData: !!cafe.pendingData, // frontend biết có bản chờ duyệt
      createdAt: cafe.createdAt,
      owner: cafe.owner
        ? {
            id: cafe.owner.id,
            fullName: cafe.owner.fullName,
            email: cafe.owner.email,
          }
        : null,
      avgRating: Math.round(Number(raw[i].avg_rating) * 10) / 10,
      reviewCount: Number(raw[i].review_count),
    }));

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Admin: ẩn / hiện cafe (APPROVED ↔ HIDDEN) ────────────────────────
  async toggleVisibility(
    id: string,
    rejectionReason?: string,
  ): Promise<{ id: string; status: CafeStatus }> {
    const cafe = await this.cafesRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!cafe) {
      throw new NotFoundException(`Quán cà phê ${id} không tìm thấy`);
    }

    if (![CafeStatus.APPROVED, CafeStatus.HIDDEN].includes(cafe.status)) {
      throw new ForbiddenException(
        'Chỉ có thể ẩn/hiện quán đang ở trạng thái approved hoặc hidden',
      );
    }

    if (cafe.status === CafeStatus.APPROVED) {
      cafe.status = CafeStatus.HIDDEN;
      if (rejectionReason) {
        cafe.rejectionReason = rejectionReason;
      }
      // Gửi email thông báo cho chủ quán
      if (cafe.owner && cafe.owner.email) {
        try {
          await this.mailService.sendCafeHiddenNotification(
            cafe.owner.email,
            cafe.name,
            rejectionReason || '管理者による非表示設定',
          );
        } catch (mailErr) {
          console.error('Failed to send email notification to owner:', mailErr);
        }
      }
    } else {
      cafe.status = CafeStatus.APPROVED;
      cafe.rejectionReason = null as any; // clear the reason when unhiding
    }

    await this.cafesRepository.save(cafe);

    return { id: cafe.id, status: cafe.status };
  }
}
