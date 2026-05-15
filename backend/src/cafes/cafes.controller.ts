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
