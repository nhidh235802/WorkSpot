import { Controller, Get, Patch, Query, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from '../users/dto/update-status.dto'; // Import DTO trạng thái đã có

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Bắt buộc đăng nhập + đúng quyền
@Roles(UserRole.ADMIN) // Chỉ Admin cấp cao mới có quyền truy cập cụm API này
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/stats
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // GET /admin/users?name=&email=&role=&status=&page=1&limit=10
  @Get('users')
  @HttpCode(HttpStatus.OK)
  getUsers(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: string, // BỔ SUNG: Nhận bộ lọc trạng thái tài khoản từ UI
    @Query('page') page?: string,     // Đổi sang string để thực hiện parse an toàn bên dưới
    @Query('limit') limit?: string,   // Đổi sang string để thực hiện parse an toàn bên dưới
  ) {
    // Ép kiểu số học rõ ràng để tránh lỗi nhân chuỗi (String Multiplication) ở tầng cơ sở dữ liệu
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.adminService.getUsers({
      name,
      email,
      role,
      status,
      page: parsedPage,
      limit: parsedLimit,
    });
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return await this.adminService.updateUserStatus(id, dto.status);
  }
}