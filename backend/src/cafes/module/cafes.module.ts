import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafesService } from '../services/cafes.service';
import { CafesController } from '../controllers/cafes.controller';
import { Cafe } from '../entities/cafe.entity';
import { OperatingHour } from '../entities/operating-hour.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cafe, OperatingHour, User])],
  controllers: [CafesController],
  providers: [CafesService],
})
export class CafesModule {}
