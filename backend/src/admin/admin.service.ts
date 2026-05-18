import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
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

    // Trend đăng ký cafe theo tháng (năm hiện tại)
    const year = new Date().getFullYear();
    const cafeTrend = await this.cafeRepo
      .createQueryBuilder('c')
      .select('EXTRACT(MONTH FROM c.createdAt)::int', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM c.createdAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM c.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Trend tạo account theo tháng
    const accountTrend = await this.userRepo
      .createQueryBuilder('u')
      .select('EXTRACT(MONTH FROM u.createdAt)::int', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM u.createdAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM u.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalAccounts, // KPI: tổng tài khoản
      totalCafes, // KPI: tổng cửa hàng
      pendingCafes, // KPI: chờ duyệt (màu cam)
      activeCafes, // KPI: đang hoạt động (màu xanh)
      rejectedCafes, // dùng cho donut chart
      cafeTrend, // [{month: 1, count: '5'}, ...]
      accountTrend,
    };
  }

  // ── User management ──────────────────────────────────────────
  async getUsers(filters: {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { name, email, role, page = 1, limit = 10 } = filters;
    const qb = this.userRepo.createQueryBuilder('u');

    if (name) qb.andWhere('u.fullName ILIKE :name', { name: `%${name}%` });
    if (email) qb.andWhere('u.email    ILIKE :email', { email: `%${email}%` });
    if (role) qb.andWhere('u.role = :role', { role });

    const [items, total] = await qb
      .select(['u.id', 'u.fullName', 'u.email', 'u.role', 'u.createdAt'])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }
}
