// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Cafe } from '../cafes/entities/cafe.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Cafe]), // inject 2 repo
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
