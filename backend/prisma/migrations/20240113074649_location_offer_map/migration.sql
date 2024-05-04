/*
  Warnings:

  - You are about to drop the column `user_offers_map_id` on the `tbl_users` table. All the data in the column will be lost.
  - You are about to drop the `tbl_user_offers_map` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbl_users" DROP CONSTRAINT "fk_tbl_users_tbl_user_offers_map_offers_map_id";

-- AlterTable
ALTER TABLE "tbl_users" DROP COLUMN "user_offers_map_id",
ADD COLUMN     "location_offers_map_id" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "tbl_user_offers_map";

-- CreateTable
CREATE TABLE "tbl_location_offers_map" (
    "location_offers_map_id" SERIAL NOT NULL,
    "lat_1" DOUBLE PRECISION NOT NULL,
    "lat_2" DOUBLE PRECISION NOT NULL,
    "lat_3" DOUBLE PRECISION NOT NULL,
    "lat_4" DOUBLE PRECISION NOT NULL,
    "lng_1" DOUBLE PRECISION NOT NULL,
    "lng_2" DOUBLE PRECISION NOT NULL,
    "lng_3" DOUBLE PRECISION NOT NULL,
    "lng_4" DOUBLE PRECISION NOT NULL,
    "subscription_type_ids" VARCHAR,
    "plan_type_ids" VARCHAR,
    "coupon_type_ids" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,

    CONSTRAINT "tbl_location_offers_map_pkey" PRIMARY KEY ("location_offers_map_id")
);

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "fk_tbl_users_tbl_user_offers_map_offers_map_id" FOREIGN KEY ("location_offers_map_id") REFERENCES "tbl_location_offers_map"("location_offers_map_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
