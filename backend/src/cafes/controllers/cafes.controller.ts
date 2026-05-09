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
} from '@nestjs/common';
import { CafesService } from '../services/cafes.service';
import { CreateCafeDto } from '../dto/create-cafe.dto';
import { UpdateCafeDto } from '../dto/update-cafe.dto';
import { SearchCafeDto } from '../dto/search-cafe.dto';

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCafeDto: UpdateCafeDto) {
    return this.cafesService.update(id, updateCafeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.cafesService.remove(id);
  }
}