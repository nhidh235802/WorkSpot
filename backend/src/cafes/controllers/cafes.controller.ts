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
  ParseFloatPipe,
} from '@nestjs/common';
import { CafesService } from '../services/cafes.service';
import { CreateCafeDto } from '../dto/create-cafe.dto';
import { UpdateCafeDto } from '../dto/update-cafe.dto';
import { SearchCafeDto } from '../dto/search-cafe.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

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

  @Post()
  create(@Body() createCafeDto: CreateCafeDto) {
    return this.cafesService.create(createCafeDto);
  }

  @Get('search')
  searchCafes(@Query() searchCafeDto: SearchCafeDto) {
    return this.cafesService.searchCafes(searchCafeDto);
  }

  @Get()
  findAll() {
    return this.cafesService.findAll();
  }

  // HÀM FIND ONE PHẢI NẰM DƯỚI HÀM SEARCH
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cafesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCafeDto: UpdateCafeDto) {
    return this.cafesService.update(id, updateCafeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.cafesService.remove(id);
  }
}
