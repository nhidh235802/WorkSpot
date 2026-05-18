// src/admin/admin.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // bắt buộc login + đúng role
@Roles(UserRole.ADMIN) // chỉ ADMIN mới vào được
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/stats
  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // GET /admin/users?name=&email=&role=&page=1&limit=10
  @Get('users')
  getUsers(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers({ name, email, role, page, limit });
  }
}
