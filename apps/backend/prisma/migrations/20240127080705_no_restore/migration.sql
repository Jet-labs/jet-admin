/*
  Warnings:

  - You are about to drop the column `estimated_reservation_end_at` on the `tbl_reservations` table. All the data in the column will be lost.
  - You are about to drop the column `reservation_initiation_at` on the `tbl_reservations` table. All the data in the column will be lost.
  - You are about to drop the column `total_pause_time` on the `tbl_reservations` table. All the data in the column will be lost.
  - You are about to drop the `tbl_master` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tbl_offer_purchase_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tbl_receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tbl_ride_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tbl_rides` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reservation_station_id` to the `tbl_reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_type_id` to the `tbl_reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tbl_reservations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_receipts_receipt_id";

-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_reservations_reservation_id";

-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_ride_reviews_ride_review_id";

-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_rides_ride_id";

-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_transactions_transaction_id";

-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_users_user_id";

-- DropForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" DROP CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_plan_types_plan_type_id";

-- DropForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" DROP CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_subscription_types_subsc";

-- DropForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" DROP CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_wallets_wallet_id";

-- DropForeignKey
ALTER TABLE "tbl_rides" DROP CONSTRAINT "fk_tbl_rides_tbl_stations_ride_end_station_id";

-- DropForeignKey
ALTER TABLE "tbl_rides" DROP CONSTRAINT "fk_tbl_rides_tbl_stations_ride_start_station_id";

-- DropForeignKey
ALTER TABLE "tbl_rides" DROP CONSTRAINT "fk_tbl_rides_tbl_vehicles_vehicle_id";

-- AlterTable
ALTER TABLE "tbl_coupons" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "tbl_inter_wallet_transactions" ALTER COLUMN "inter_wallet_transaction_status" SET DEFAULT 'PENDING',
ALTER COLUMN "inter_wallet_transaction_status" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "tbl_location_offers_map" ADD COLUMN     "pause_time_charge" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "reservation_type_ids" INTEGER[],
ADD COLUMN     "ride_time_charge" INTEGER NOT NULL DEFAULT 270;

-- AlterTable
ALTER TABLE "tbl_reservations" DROP COLUMN "estimated_reservation_end_at",
DROP COLUMN "reservation_initiation_at",
DROP COLUMN "total_pause_time",
ADD COLUMN     "reservation_receipt_id" INTEGER,
ADD COLUMN     "reservation_station_id" INTEGER NOT NULL,
ADD COLUMN     "reservation_type_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "reservation_status" SET DEFAULT 'PENDING',
ALTER COLUMN "reservation_status" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "tbl_security_deposit_transactions" ALTER COLUMN "security_deposit_transaction_status" SET DEFAULT 'PENDING',
ALTER COLUMN "security_deposit_transaction_status" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "tbl_user_types" ADD COLUMN     "initial_coupon_type_id" INTEGER,
ADD COLUMN     "initial_plan_type_id" INTEGER,
ADD COLUMN     "initial_subscription_type_id" INTEGER,
ADD COLUMN     "max_coupons" INTEGER DEFAULT 10000;

-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "last_seen" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "tbl_vehicle_types" ADD COLUMN     "make" VARCHAR NOT NULL DEFAULT 'Hero',
ADD COLUMN     "model" VARCHAR NOT NULL DEFAULT 'Activa 4G';

-- AlterTable
ALTER TABLE "tbl_vehicles" ADD COLUMN     "ble_name" VARCHAR NOT NULL DEFAULT 'HOVER_MX0001',
ADD COLUMN     "ble_service_uuid" UUID NOT NULL DEFAULT '4fafc201-1fb5-459e-8fcc-c5c9c331914b'::uuid,
ADD COLUMN     "ble_token" VARCHAR NOT NULL DEFAULT 'mx00011234567890',
ADD COLUMN     "ble_uuid" UUID NOT NULL DEFAULT 'beb5483e-36e1-4688-b7f5-ea07361b26a8'::uuid,
ALTER COLUMN "vehicle_status" SET DEFAULT 'MAINTAINANCE',
ALTER COLUMN "vehicle_status" SET DATA TYPE VARCHAR,
ALTER COLUMN "vehicle_number" SET DEFAULT 'HS0004';

-- AlterTable
ALTER TABLE "tbl_wallet_recharge_transactions" ALTER COLUMN "wallet_recharge_transaction_status" SET DEFAULT 'PENDING',
ALTER COLUMN "wallet_recharge_transaction_status" SET DATA TYPE VARCHAR;

-- DropTable
DROP TABLE "tbl_master";

-- DropTable
DROP TABLE "tbl_offer_purchase_transactions";

-- DropTable
DROP TABLE "tbl_receipts";

-- DropTable
DROP TABLE "tbl_ride_reviews";

-- DropTable
DROP TABLE "tbl_rides";

-- CreateTable
CREATE TABLE "tbl_subscription_purchase_receipts" (
    "subscription_purchase_receipt_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subscription_type_id" INTEGER NOT NULL,
    "subscription_purchase_receipt_status" VARCHAR NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "payment_source" VARCHAR NOT NULL,
    "alloted_subscription_id" INTEGER,

    CONSTRAINT "tbl_subscription_purchase_receipts_pkey" PRIMARY KEY ("subscription_purchase_receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_plan_purchase_receipts" (
    "plan_purchase_receipt_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_type_id" INTEGER NOT NULL,
    "plan_purchase_receipt_status" VARCHAR NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "payment_source" VARCHAR NOT NULL,
    "alloted_plan_id" INTEGER,

    CONSTRAINT "tbl_plan_purchase_receipts_pkey" PRIMARY KEY ("plan_purchase_receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_booking_receipts" (
    "booking_receipt_id" SERIAL NOT NULL,
    "total_booking_time" INTEGER NOT NULL,
    "total_ride_time" INTEGER NOT NULL,
    "total_pause_time" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "unlock_charge" INTEGER NOT NULL DEFAULT 0,
    "pause_time_charge" INTEGER NOT NULL DEFAULT 0,
    "ride_time_charge" INTEGER NOT NULL DEFAULT 0,
    "outstation_charge" INTEGER NOT NULL DEFAULT 0,
    "other_charge" INTEGER NOT NULL DEFAULT 0,
    "minimum_charge_addition" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_charge" INTEGER NOT NULL DEFAULT 0,
    "ride_start_at" TIMESTAMPTZ(6),
    "ride_end_at" TIMESTAMPTZ(6),
    "surge_charge" INTEGER,

    CONSTRAINT "tbl_receipts_pkey" PRIMARY KEY ("booking_receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_booking_reviews" (
    "booking_review_id" SERIAL NOT NULL,
    "text" VARCHAR,
    "stars" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_booking_reviews_pkey" PRIMARY KEY ("booking_review_id")
);

-- CreateTable
CREATE TABLE "tbl_bookings" (
    "booking_id" SERIAL NOT NULL,
    "booking_status" VARCHAR NOT NULL DEFAULT 'RIDING',
    "vehicle_id" INTEGER NOT NULL,
    "booking_start_station_id" INTEGER NOT NULL,
    "booking_end_station_id" INTEGER,
    "booking_pause_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_pause_at" TIMESTAMPTZ(6),
    "last_resume_at" TIMESTAMPTZ(6),
    "booking_initiation_at" TIMETZ(6),
    "booking_start_at" TIMESTAMPTZ(6),
    "estimated_booking_end_at" TIMESTAMPTZ(6),
    "booking_end_at" TIMESTAMPTZ(6),
    "booking_receipt_id" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "tbl_booking_logs" (
    "booking_log_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "booking_action" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_booking_logs_pkey" PRIMARY KEY ("booking_log_id")
);

-- CreateTable
CREATE TABLE "tbl_coupon_purchase_receipts" (
    "coupon_purchase_receipt_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "coupon_type_id" INTEGER NOT NULL,
    "coupon_purchase_receipt_status" VARCHAR NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "payment_source" VARCHAR NOT NULL,
    "alloted_coupon_id" INTEGER,

    CONSTRAINT "tbl_coupon_purchase_receipts_pkey" PRIMARY KEY ("coupon_purchase_receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_reservation_receipts" (
    "reservation_receipt_id" SERIAL NOT NULL,
    "reservation_type_id" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "reservation_time_charge" INTEGER NOT NULL DEFAULT 0,
    "surge_charge" INTEGER NOT NULL DEFAULT 0,
    "other_charge" INTEGER NOT NULL DEFAULT 0,
    "total_charge" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservation_start_at" TIMESTAMPTZ(6),
    "reservation_end_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_reservation_receipts_pkey" PRIMARY KEY ("reservation_receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_reservation_types" (
    "reservation_type_id" SERIAL NOT NULL,
    "reservation_time" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "amount" INTEGER DEFAULT 2000,

    CONSTRAINT "tbl_reservation_types_pk" PRIMARY KEY ("reservation_type_id")
);

-- AddForeignKey
ALTER TABLE "tbl_payment_orders" ADD CONSTRAINT "fk_tbl_payment_transactions_tbl_inter_wallet_transactions_inter" FOREIGN KEY ("inter_wallet_transaction_id") REFERENCES "tbl_inter_wallet_transactions"("inter_wallet_transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_coupons" ADD CONSTRAINT "tbl_coupons_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_subscription_purchase_receipts" ADD CONSTRAINT "fk_tbl_subscription_purchase_receipts_tbl_subscription_types_su" FOREIGN KEY ("subscription_type_id") REFERENCES "tbl_subscription_types"("subscription_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_subscription_purchase_receipts" ADD CONSTRAINT "fk_tbl_subscription_purchase_receipts_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_plan_purchase_receipts" ADD CONSTRAINT "fk_tbl_plan_purchase_receipts_tbl_plan_types_su" FOREIGN KEY ("plan_type_id") REFERENCES "tbl_plan_types"("plan_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_plan_purchase_receipts" ADD CONSTRAINT "fk_tbl_plan_purchase_receipts_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "fk_tbl_bookings_tbl_bookings_receipts_booking_receipt_id" FOREIGN KEY ("booking_receipt_id") REFERENCES "tbl_booking_receipts"("booking_receipt_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "fk_tbl_bookings_tbl_stations_booking_end_station_id" FOREIGN KEY ("booking_end_station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "fk_tbl_bookings_tbl_stations_booking_start_station_id" FOREIGN KEY ("booking_start_station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "fk_tbl_bookings_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "fk_tbl_bookings_tbl_vehicles_vehicle_id" FOREIGN KEY ("vehicle_id") REFERENCES "tbl_vehicles"("vehicle_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_booking_logs" ADD CONSTRAINT "fk_tbl_booking_logs_tbl_bookings_booking_id" FOREIGN KEY ("booking_id") REFERENCES "tbl_bookings"("booking_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_booking_logs" ADD CONSTRAINT "fk_tbl_booking_logs_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_coupon_purchase_receipts" ADD CONSTRAINT "fk_tbl_coupon_purchase_receipts_tbl_plan_types_su" FOREIGN KEY ("coupon_type_id") REFERENCES "tbl_coupon_types"("coupon_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_coupon_purchase_receipts" ADD CONSTRAINT "fk_tbl_coupon_purchase_receipts_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservation_receipts" ADD CONSTRAINT "fk_tbl_reservation_receipts_tbl_reservation_types_reservation_t" FOREIGN KEY ("reservation_type_id") REFERENCES "tbl_reservation_types"("reservation_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservations" ADD CONSTRAINT "fk_tbl_reservations_tbl_reservation_types_reservation_type_id" FOREIGN KEY ("reservation_type_id") REFERENCES "tbl_reservation_types"("reservation_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservations" ADD CONSTRAINT "fk_tbl_reservations_tbl_reservations_receipts_reservation_recei" FOREIGN KEY ("reservation_receipt_id") REFERENCES "tbl_reservation_receipts"("reservation_receipt_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservations" ADD CONSTRAINT "fk_tbl_reservations_tbl_stations_reservation_station_id" FOREIGN KEY ("reservation_station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservations" ADD CONSTRAINT "fk_tbl_reservations_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
