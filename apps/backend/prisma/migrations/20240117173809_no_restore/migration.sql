/*
  Warnings:

  - You are about to drop the column `ride_receipt_target_field` on the `tbl_coupon_types` table. All the data in the column will be lost.
  - The `subscription_type_ids` column on the `tbl_location_offers_map` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan_type_ids` column on the `tbl_location_offers_map` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coupon_type_ids` column on the `tbl_location_offers_map` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coupon_type_ids` column on the `tbl_plan_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coupon_ids` column on the `tbl_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `payment_source` on the `tbl_security_deposit_transactions` table. All the data in the column will be lost.
  - The `coupon_type_ids` column on the `tbl_subscription_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `coupon_ids` column on the `tbl_subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `plan_type_ids` on the `tbl_user_types` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_type_ids` on the `tbl_user_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_coupon_types" DROP COLUMN "ride_receipt_target_field",
ADD COLUMN     "booking_receipt_target_field" VARCHAR,
ALTER COLUMN "rule_action_value" SET DEFAULT 0,
ALTER COLUMN "rule_action_value" SET DATA TYPE DECIMAL,
ALTER COLUMN "rule_action_limiting_value" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "tbl_coupons" ALTER COLUMN "rule_action_limiting_value_balance" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "tbl_location_offers_map" DROP COLUMN "subscription_type_ids",
ADD COLUMN     "subscription_type_ids" INTEGER[],
DROP COLUMN "plan_type_ids",
ADD COLUMN     "plan_type_ids" INTEGER[],
DROP COLUMN "coupon_type_ids",
ADD COLUMN     "coupon_type_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tbl_payment_orders" ADD COLUMN     "inter_wallet_transaction_id" INTEGER;

-- AlterTable
ALTER TABLE "tbl_plan_types" DROP COLUMN "coupon_type_ids",
ADD COLUMN     "coupon_type_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tbl_plans" DROP COLUMN "coupon_ids",
ADD COLUMN     "coupon_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tbl_security_deposit_transactions" DROP COLUMN "payment_source";

-- AlterTable
ALTER TABLE "tbl_subscription_types" DROP COLUMN "coupon_type_ids",
ADD COLUMN     "coupon_type_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tbl_subscriptions" DROP COLUMN "coupon_ids",
ADD COLUMN     "coupon_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tbl_user_types" DROP COLUMN "plan_type_ids",
DROP COLUMN "subscription_type_ids";
