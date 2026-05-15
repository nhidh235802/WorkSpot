import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cafe, CafeStatus } from './entities/cafe.entity';
import { OperatingHour } from './entities/operating-hour.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { CafeDetailResponseDto } from './dto/cafe-detail-response.dto';
import { SearchCafeDto } from './dto/search-cafe.dto';

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
  ) {}

  async getRecommended(userLat: number, userLng: number): Promise<any[]> {
    const maxDist = 10; // Bán kính chuẩn hóa 10km

    // Công thức Haversine tính khoảng cách (km)
    const haversineExpr = [
      '(6371 * acos(',
      '  LEAST(1, cos(radians(:lat)) * cos(radians(cafe.latitude))',
      '  * cos(radians(cafe.longitude) - radians(:lng))',
      '  + sin(radians(:lat)) * sin(radians(cafe.latitude)))',
      '))',
    ].join('');

    // Điểm đánh giá tính động: AVG từ bảng reviews, quán chưa có review = 0
    const avgRatingExpr = 'COALESCE(AVG(review.rating), 0)';

    // Công thức tổng điểm: 60% khoảng cách (đã chuẩn hóa) + 40% điểm đánh giá
    const scoreExpr = [
      '((GREATEST(0, :maxDist - ',
      haversineExpr,
      ') / :maxDist) * 60)',
      ` + ((${avgRatingExpr} / 5) * 40)`,
    ].join('');

    const result: { entities: Cafe[]; raw: any[] } = await this.cafesRepository
      .createQueryBuilder('cafe')
      // JOIN với bảng reviews để tính AVG rating (LEFT JOIN để giữ quán chưa có review)
      .leftJoin('cafe.reviews', 'review')
      // Lọc trạng thái "Đang hiển thị" (approved)
      .where('cafe.status = :status', { status: CafeStatus.APPROVED })
      // GROUP BY để AVG hoạt động đúng
      .groupBy('cafe.id')
      // Gắn khoảng cách và điểm rating trung bình vào kết quả
      .addSelect(haversineExpr, 'distance')
      .addSelect(avgRatingExpr, 'avg_rating')
      .addSelect(scoreExpr, 'total_score')
      // Sắp xếp theo tổng điểm từ cao xuống thấp (dùng raw expr thay alias vì TypeORM không hỗ trợ alias trong orderBy)
      .orderBy(scoreExpr, 'DESC')
      // Chỉ lấy đúng 6 quán
      .limit(6)
      .setParameters({ lat: userLat, lng: userLng, maxDist })
      .getRawAndEntities();

    // Kết hợp dữ liệu quán, rating động và khoảng cách trả về cho Frontend
    return result.entities.map((entity, index) => {
      const rawItem = result.raw[index] as {
        avg_rating: number;
        distance: number;
      };
      return {
        ...entity,
        rating: Math.round(rawItem.avg_rating * 10) / 10, // Làm tròn 1 chữ số thập phân
        distance: Math.round(rawItem.distance * 10) / 10,
      };
    });
  }

  async create(createCafeDto: CreateCafeDto): Promise<CafeDetailResponseDto> {
    const { ownerId, operatingHours, ...cafeData } = createCafeDto;

    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException(`Người dùng #${ownerId} không tìm thấy`);
    }

    const cafe = this.cafesRepository.create({ ...cafeData, owner });
    const savedCafe = await this.cafesRepository.save(cafe);

    if (operatingHours?.length) {
      const hours = operatingHours.map((h) =>
        this.operatingHoursRepository.create({ ...h, cafe: savedCafe }),
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
    updateCafeDto: UpdateCafeDto,
  ): Promise<CafeDetailResponseDto> {
    const cafe = await this.findOneEntity(id);
    const { ownerId, operatingHours, ...cafeData } = updateCafeDto;

    const updatedCafe = await this.cafesRepository.manager.transaction(
      async (manager) => {
        if (ownerId) {
          const owner = await manager.findOne(User, { where: { id: ownerId } });
          if (!owner) {
            throw new NotFoundException(`Người dùng ${ownerId} không tìm thấy`);
          }
          cafe.owner = owner;
        }

        if (operatingHours !== undefined) {
          await manager.delete(OperatingHour, { cafe: { id } });
          if (operatingHours.length) {
            const hours = operatingHours.map((h) =>
              manager.create(OperatingHour, { ...h, cafe }),
            );
            await manager.save(OperatingHour, hours);
          }
        }

        Object.assign(cafe, cafeData);
        return manager.save(Cafe, cafe); // trả về Cafe entity
      },
    );

    return this.findOne(updatedCafe.id); // rồi map sang DTO
  }

  async remove(id: string): Promise<void> {
    const cafe = await this.findOneEntity(id);
    await this.cafesRepository.remove(cafe);
  }

  // TÌM KIẾM VÀ LỌC QUÁN CAFE
  async searchCafes(query: SearchCafeDto): Promise<any[]> {
    const { lat, lng, radius, keyword } = query;

    // Haversine distance expression – uses named params (no interpolation → no SQL injection)
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
      .where('cafe.status = :status', { status: 'approved' })
      .groupBy('cafe.id')
      .addSelect(distanceSql, 'distance')
      .addSelect(avgRatingExpr, 'avg_rating')
      .setParameters({ searchLat: lat, searchLng: lng });

    // 1. Lọc theo Keyword (Tên/Địa chỉ)
    if (keyword) {
      queryBuilder.andWhere(
        '(cafe.name ILIKE :keyword OR cafe.address ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 2. XỬ LÝ FILTER FACILITIES (AND logic – tất cả filter được chọn phải khớp)
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
          { [paramName]: filterMapping[key] },
        );
      }
    }

    // 3. Lọc bán kính — chỉ áp dụng khi KHÔNG có keyword
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
}
