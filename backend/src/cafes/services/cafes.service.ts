import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cafe } from '../entities/cafe.entity';
import { OperatingHour } from '../entities/operating-hour.entity';
import { User } from '../../users/entities/user.entity';
import { CreateCafeDto } from '../dto/create-cafe.dto';
import { UpdateCafeDto } from '../dto/update-cafe.dto';
import { SearchCafeDto } from '../dto/search-cafe.dto';

@Injectable()
export class CafesService {
  constructor(
    @InjectRepository(Cafe)
    private readonly cafesRepository: Repository<Cafe>,
    @InjectRepository(OperatingHour)
    private readonly operatingHoursRepository: Repository<OperatingHour>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createCafeDto: CreateCafeDto): Promise<Cafe> {
    const { ownerId, operatingHours, ...cafeData } = createCafeDto;

    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
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

  findAll(): Promise<Cafe[]> {
    return this.cafesRepository.find({
      relations: ['owner', 'operatingHours'],
    });
  }

  async findOne(id: string): Promise<Cafe> {
    const cafe = await this.cafesRepository.findOne({
      where: { id },
      relations: ['owner', 'operatingHours', 'reviews'],
    });
    if (!cafe) {
      throw new NotFoundException(`Quán cà phê #${id} không tìm thấy`);
    }
    return cafe;
  }

  async update(id: string, updateCafeDto: UpdateCafeDto): Promise<Cafe> {
    const cafe = await this.findOne(id);
    const { ownerId, operatingHours, ...cafeData } = updateCafeDto;

    if (ownerId) {
      const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException(`Người dùng #${ownerId} không tìm thấy`);
      }
      cafe.owner = owner;
    }

    if (operatingHours !== undefined) {
      await this.operatingHoursRepository.delete({ cafe: { id } });
      if (operatingHours.length) {
        const hours = operatingHours.map((h) =>
          this.operatingHoursRepository.create({ ...h, cafe }),
        );
        await this.operatingHoursRepository.save(hours);
      }
    }

    Object.assign(cafe, cafeData);
    return this.cafesRepository.save(cafe);
  }

  async remove(id: string): Promise<void> {
    const cafe = await this.findOne(id);
    await this.cafesRepository.remove(cafe);
  }

  // TÌM KIẾM VÀ LỌC QUÁN CAFE
  async searchCafes(query: SearchCafeDto): Promise<Cafe[]> {
    const { lat, lng, radius, keyword } = query;

    console.log('[SEARCH] Received query:', JSON.stringify(query, null, 2));

    const queryBuilder = this.cafesRepository.createQueryBuilder('cafe')
      .where('cafe.status = :status', { status: 'approved' });

    // 1. Lọc theo Keyword (Tên/Địa chỉ)
    if (keyword) {
      queryBuilder.andWhere(
        '(cafe.name ILIKE :keyword OR cafe.address ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    // 2. XỬ LÝ FILTER FACILITIES (Lặp qua từng filter và apply AND logic)
    const filterMapping: Record<string, string> = {
      hasWifi: 'wifi',
      hasPower: 'socket',
      hasDesk: 'desk',
      hasSnacks: 'snack',
      isClean: 'cleanliness',
      isFocusFriendly: 'workspace',
      allowsSmoking: 'smoking_rule',
      hasFlexibleHours: 'flexible_hours'
    };

    let filterIndex = 0;
    Object.keys(filterMapping).forEach((key) => {
      const filterValue = query[key as keyof SearchCafeDto];
      console.log(`[FILTER] ${key} = ${filterValue} (type: ${typeof filterValue})`);
      
      if (filterValue === true) {
        const enumValue = filterMapping[key];
        const paramName = `facility${filterIndex}`;
        console.log(`[APPLY] Adding filter: ${key} -> ${enumValue}`);
        queryBuilder.andWhere(
          `cafe.facilities @> ARRAY[:${paramName}]::public.cafes_facilities_enum[]`,
          { [paramName]: enumValue }
        );
        filterIndex++;
      }
    });

    // 3. Tính toán khoảng cách và lọc bán kính
    const distanceSql = `( 6371 * acos( cos( radians(${lat}) ) * cos( radians( cafe.latitude ) ) * cos( radians( cafe.longitude ) - radians(${lng}) ) + sin( radians(${lat}) ) * sin( radians( cafe.latitude ) ) ) )`;

    queryBuilder.addSelect(distanceSql, 'distance');
    queryBuilder.andWhere(`${distanceSql} <= :radius`, { radius });
    queryBuilder.orderBy('distance', 'ASC');

    console.log('[SQL] Generated Query:', queryBuilder.getSql());
    console.log('[PARAMS] Query Parameters:', queryBuilder.getParameters());

    const results = await queryBuilder.getMany();
    console.log(`[RESULTS] Found ${results.length} cafes matching criteria`);
    
    return results;
  }
}