import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity'; // Bổ sung import UserStatus
import { Cafe, CafeStatus } from '../cafes/entities/cafe.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Cafe) private cafeRepo: Repository<Cafe>,
  ) {}

  // ── Dashboard stats ──────────────────────────────────────────
  async getDashboardStats() {
    const [
      totalAccounts,
      totalCafes,
      pendingCafes,
      activeCafes,
      rejectedCafes,
      hiddenCafes,
    ] = await Promise.all([
      this.userRepo.count(),
      this.cafeRepo.count(),
      this.cafeRepo.count({ where: { status: CafeStatus.PENDING } }),
      this.cafeRepo.count({ where: { status: CafeStatus.APPROVED } }),
      this.cafeRepo.count({ where: { status: CafeStatus.REJECTED } }),
      this.cafeRepo.count({ where: { status: CafeStatus.HIDDEN } }),
    ]);

    const year = new Date().getFullYear();
    const cafeTrend = await this.cafeRepo
      .createQueryBuilder('c')
      .select('EXTRACT(MONTH FROM c.createdAt)::int', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM c.createdAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM c.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const accountTrend = await this.userRepo
      .createQueryBuilder('u')
      .select('EXTRACT(MONTH FROM u.createdAt)::int', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM u.createdAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM u.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalAccounts,
      totalCafes,
      pendingCafes,
      activeCafes,
      rejectedCafes,
      cafeTrend,
      accountTrend,
    };
  }

  // ── User management ──────────────────────────────────────────
  async getUsers(filters: {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: string; // Nhận trạng thái lọc từ query frontend
    page?: number;
    limit?: number;
  }) {
    const { name, email, role, status, page = 1, limit = 10 } = filters;
    const qb = this.userRepo.createQueryBuilder('u');

    if (name) qb.andWhere('u.fullName ILIKE :name', { name: `%${name}%` });
    if (email) qb.andWhere('u.email     ILIKE :email', { email: `%${email}%` });
    if (role) qb.andWhere('u.role = :role', { role });
    
    // BỔ SUNG: Điều kiện lọc theo trạng thái tài khoản (active, disabled, suspended)
    if (status) {
      qb.andWhere('u.status = :status', { status });
    }

    // Sắp xếp người dùng mới tạo lên đầu tiên
    qb.orderBy('u.createdAt', 'DESC');

    const [items, total] = await qb
      // BỔ SUNG: select thêm 'u.avatar' và 'u.status' phục vụ render UI
      .select(['u.id', 'u.fullName', 'u.email', 'u.role', 'u.avatar', 'u.status', 'u.createdAt'])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  // BỔ SUNG: Logic xử lý thay đổi trạng thái tài khoản cho nút bấm 無効化 và 停止
  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません。');
    }

    user.status = status;
    return await this.userRepo.save(user);
  }
}