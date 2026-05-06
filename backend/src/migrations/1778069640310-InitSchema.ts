import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1778069640310 implements MigrationInterface {
  name = 'InitSchema1778069640310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."operating_hours_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "operating_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dayOfWeek" "public"."operating_hours_dayofweek_enum" NOT NULL, "openTime" character varying(5), "closeTime" character varying(5), "isDayOff" boolean NOT NULL DEFAULT false, "cafe_id" uuid, CONSTRAINT "PK_2ada48e2269e8c902ec3f00439e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" smallint NOT NULL, "comment" text, "images" text array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "cafe_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cafes_facilities_enum" AS ENUM('wifi', 'socket', 'workspace', 'desk', 'snack', 'cleanliness', 'smoking_rule')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cafes_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cafes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "address" character varying(255) NOT NULL, "latitude" double precision, "longitude" double precision, "avatar" text, "images" text array NOT NULL DEFAULT '{}', "facilities" "public"."cafes_facilities_enum" array NOT NULL DEFAULT '{}', "isClosedOnHolidays" boolean NOT NULL DEFAULT false, "status" "public"."cafes_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" uuid, CONSTRAINT "PK_1e8e00a60bc4dd368d8d55a1d7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'owner', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "password" character varying(255) NOT NULL, "avatar" text, "address" text, "bio" text, "role" "public"."users_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" ADD CONSTRAINT "FK_542383929e5c597c3ba1e5e1646" FOREIGN KEY ("cafe_id") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_85865803efbc05105cc0affd1e6" FOREIGN KEY ("cafe_id") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cafes" ADD CONSTRAINT "FK_2a30e1217e074319e8b4dc76603" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cafes" DROP CONSTRAINT "FK_2a30e1217e074319e8b4dc76603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_85865803efbc05105cc0affd1e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_542383929e5c597c3ba1e5e1646"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "cafes"`);
    await queryRunner.query(`DROP TYPE "public"."cafes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cafes_facilities_enum"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "operating_hours"`);
    await queryRunner.query(
      `DROP TYPE "public"."operating_hours_dayofweek_enum"`,
    );
  }
}
