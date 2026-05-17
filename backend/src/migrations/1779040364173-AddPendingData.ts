import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPendingData1779040364173 implements MigrationInterface {
    name = 'AddPendingData1779040364173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafes" ADD "pendingData" jsonb`);
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "images" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "images" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "images" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "images" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cafes" DROP COLUMN "pendingData"`);
    }

}
