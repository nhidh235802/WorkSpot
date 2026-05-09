import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class ProfileResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;

  @Expose()
  phone: string | null = null;

  @Expose()
  avatar: string | null = null;

  @Expose()
  address: string | null = null;

  @Expose()
  bio: string | null = null;

  @Expose()
  role!: UserRole;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial?: Partial<ProfileResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
