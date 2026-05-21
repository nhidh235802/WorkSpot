import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatusField1779100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo kiểu ENUM cho trạng thái user
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'disabled', 'suspended')`,
    );
    // Bổ sung cột vào bảng users với giá trị mặc định là 'active'
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
  }
}