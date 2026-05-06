import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUpdateColumnInReview1778072724413 implements MigrationInterface {
  name = 'DeleteUpdateColumnInReview1778072724413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "updatedAt"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
