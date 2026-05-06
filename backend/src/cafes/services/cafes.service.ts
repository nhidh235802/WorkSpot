import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cafe } from '../entities/cafe.entity';
import { OperatingHour } from '../entities/operating-hour.entity';
import { User } from '../../users/entities/user.entity';
import { CreateCafeDto } from '../dto/create-cafe.dto';
import { UpdateCafeDto } from '../dto/update-cafe.dto';

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
}
