import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Param, // <--- BỔ SUNG THÊM DECORATOR NÀY ĐỂ LẤY ID TỪ URL
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { AdminQueryUserDto } from './dto/admin-query-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateUserStatusDto } from './dto/update-status.dto';  

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================================================
  // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────
  // =====================================================================

  // GET /users/admin/stats
  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return await this.usersService.getAdminStats();
  }

  // GET /users/admin/list
  @Get('admin/list')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAllForAdmin(@Query() query: AdminQueryUserDto) {
    return await this.usersService.findAllForAdmin(query);
  }

  // PATCH /users/admin/:id/status (BỔ SUNG ROUTE THAY ĐỔI TRẠNG THÁI CHO NÚT BẤM)
  @Patch('admin/:id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return await this.usersService.updateStatus(id, dto);
  }

  // =====================================================================
  // ─── USER PROFILE ENDPOINTS ──────────────────────────────────────────
  // =====================================================================

  // GET /users/profile
  @Get('profile')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return await this.usersService.getProfile(req.user!.id);
  }

  // PATCH /users/profile
  @Patch('profile')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return await this.usersService.updateProfile(req.user!.id, dto);
  }

  // PUT /users/profile/change-password
  @Put('profile/change-password')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.usersService.changePassword(req.user!.id, dto);
  }

  // POST /users/profile/avatar
  @Post('profile/avatar')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          callback(null, `${(req as any).user.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return await this.usersService.updateProfile(req.user!.id, {
      avatar: avatarUrl,
    });
  }
}