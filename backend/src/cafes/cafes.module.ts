import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafesService } from './cafes.service';
import { CafesController } from './cafes.controller';
import { Cafe } from './entities/cafe.entity';
import { OperatingHour } from './entities/operating-hour.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cafe, OperatingHour, Review, User]),
    MailModule,
    SupabaseModule,
  ],
  controllers: [CafesController],
  providers: [CafesService],
  exports: [CafesService],
})
export class CafesModule {}
