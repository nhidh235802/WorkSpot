import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordFields1778100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "resetPasswordToken" character varying(255),
        ADD COLUMN IF NOT EXISTS "resetPasswordExpiry" timestamp with time zone
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "resetPasswordToken",
        DROP COLUMN IF EXISTS "resetPasswordExpiry"
    `);
  }
}
