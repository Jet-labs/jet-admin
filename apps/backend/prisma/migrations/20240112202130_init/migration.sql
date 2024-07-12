/*
  Warnings:

  - You are about to drop the column `offer_id` on the `tbl_payment_orders` table. All the data in the column will be lost.
  - You are about to drop the `tbl_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `payment_purpose` to the `tbl_payment_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_purpose_receipt_id` to the `tbl_payment_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_master" DROP CONSTRAINT "fk_tbl_master_tbl_transactions_transaction_id";

-- DropForeignKey
ALTER TABLE "tbl_transactions" DROP CONSTRAINT "fk_tbl_rides_tbl_wallets_receiver_wallet_id";

-- DropForeignKey
ALTER TABLE "tbl_transactions" DROP CONSTRAINT "fk_tbl_rides_tbl_wallets_sender_wallet_id";

-- AlterTable
ALTER TABLE "tbl_payment_orders" DROP COLUMN "offer_id",
ADD COLUMN     "payment_purpose" VARCHAR NOT NULL,
ADD COLUMN     "payment_purpose_receipt_id" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "tbl_user_types" ADD COLUMN     "max_plans" INTEGER DEFAULT 2,
ADD COLUMN     "max_subscriptions" INTEGER DEFAULT 2,
ADD COLUMN     "plan_type_ids" VARCHAR,
ADD COLUMN     "security_deposit_type_id" INTEGER DEFAULT 1,
ADD COLUMN     "subscription_type_ids" VARCHAR;

-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "last_lat" DOUBLE PRECISION,
ADD COLUMN     "last_lng" DOUBLE PRECISION,
ADD COLUMN     "user_offers_map_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "tbl_wallets" ADD COLUMN     "security_deposit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "security_deposit_at" TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "tbl_transactions";

-- CreateTable
CREATE TABLE "tbl_security_deposit_types" (
    "security_deposit_type_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,
    "amount" INTEGER NOT NULL DEFAULT 25000,

    CONSTRAINT "tbl_security_deposit_types_pkey" PRIMARY KEY ("security_deposit_type_id")
);

-- CreateTable
CREATE TABLE "tbl_inter_wallet_transactions" (
    "inter_wallet_transaction_id" SERIAL NOT NULL,
    "inter_wallet_transaction_message" VARCHAR(300),
    "inter_wallet_transaction_status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_wallet_id" INTEGER NOT NULL,
    "receiver_wallet_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "is_refund" BOOLEAN NOT NULL DEFAULT false,
    "refund_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_inter_wallet_transactions_pkey" PRIMARY KEY ("inter_wallet_transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_wallet_recharge_transactions" (
    "wallet_recharge_transaction_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet_id" INTEGER,
    "wallet_recharge_transaction_status" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_wallet_recharge_transactions_pkey" PRIMARY KEY ("wallet_recharge_transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_security_deposit_transactions" (
    "security_deposit_transaction_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet_id" INTEGER,
    "security_deposit_transaction_status" INTEGER NOT NULL DEFAULT 0,
    "payment_source" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_security_deposits_pkey" PRIMARY KEY ("security_deposit_transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_coupon_types" (
    "coupon_type_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "usage_limit" INTEGER,
    "validity_period" INTEGER,
    "ride_receipt_target_field" VARCHAR,
    "reservation_receipt_target_field" VARCHAR,
    "applicability_order" VARCHAR NOT NULL DEFAULT 'end',
    "rule_action" VARCHAR NOT NULL DEFAULT 'substract',
    "rule_action_value" INTEGER NOT NULL DEFAULT 0,
    "rule_action_limiting_value" INTEGER,
    "rule_action_limiting_value_action" VARCHAR,

    CONSTRAINT "tbl_coupon_types_pk" PRIMARY KEY ("coupon_type_id")
);

-- CreateTable
CREATE TABLE "tbl_coupons" (
    "coupon_id" SERIAL NOT NULL,
    "coupon_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "usage_balance" INTEGER,
    "validity" TIMESTAMPTZ(6),
    "rule_action_limiting_value_balance" INTEGER,

    CONSTRAINT "tbl_coupons_pk" PRIMARY KEY ("coupon_id")
);

-- CreateTable
CREATE TABLE "tbl_plan_types" (
    "plan_type_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "validity_period" INTEGER,
    "coupon_type_ids" VARCHAR NOT NULL,
    "tags" VARCHAR,
    "amount" INTEGER DEFAULT 20000,

    CONSTRAINT "tbl_plan_types_pk" PRIMARY KEY ("plan_type_id")
);

-- CreateTable
CREATE TABLE "tbl_plans" (
    "plan_id" SERIAL NOT NULL,
    "plan_type_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "validity" TIMESTAMPTZ(6),
    "coupon_ids" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_plans_pk" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "tbl_subscription_types" (
    "subscription_type_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "validity_period" INTEGER,
    "coupon_type_ids" VARCHAR NOT NULL,
    "tags" VARCHAR,
    "amount" INTEGER NOT NULL DEFAULT 2000,

    CONSTRAINT "tbl_subscription_types_pk" PRIMARY KEY ("subscription_type_id")
);

-- CreateTable
CREATE TABLE "tbl_subscriptions" (
    "subscription_id" SERIAL NOT NULL,
    "subscription_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR,
    "description" VARCHAR,
    "validity" TIMESTAMPTZ(6),
    "coupon_ids" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_subscriptions_pk" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "tbl_offer_purchase_transactions" (
    "offer_purchase_transaction_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet_id" INTEGER,
    "plan_type_id" INTEGER,
    "subscription_type_id" INTEGER,
    "offer_purchase_transaction_status" INTEGER NOT NULL DEFAULT 0,
    "payment_source" VARCHAR,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_offer_purchase_transactions_pkey" PRIMARY KEY ("offer_purchase_transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_user_offers_map" (
    "user_offers_map_id" SERIAL NOT NULL,
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

    CONSTRAINT "tbl_user_offers_map_pkey" PRIMARY KEY ("user_offers_map_id")
);

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "fk_tbl_users_tbl_user_offers_map_offers_map_id" FOREIGN KEY ("user_offers_map_id") REFERENCES "tbl_user_offers_map"("user_offers_map_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_user_types" ADD CONSTRAINT "fk_tbl_user_types_tbl_security_deposit_types_security_deposit_t" FOREIGN KEY ("security_deposit_type_id") REFERENCES "tbl_security_deposit_types"("security_deposit_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_transactions_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "tbl_inter_wallet_transactions"("inter_wallet_transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_inter_wallet_transactions" ADD CONSTRAINT "fk_tbl_inter_wallet_transactions_tbl_wallets_receiver_wallet_id" FOREIGN KEY ("receiver_wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_inter_wallet_transactions" ADD CONSTRAINT "fk_tbl_inter_wallet_transactions_tbl_wallets_sender_wallet_id" FOREIGN KEY ("sender_wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_wallet_recharge_transactions" ADD CONSTRAINT "fk_tbl_wallet_recharge_transactions_tbl_wallets_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_security_deposit_transactions" ADD CONSTRAINT "fk_tbl_security_deposits_tbl_wallets_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_coupons" ADD CONSTRAINT "tbl_coupons_tbl_coupon_types_coupon_type_id" FOREIGN KEY ("coupon_type_id") REFERENCES "tbl_coupon_types"("coupon_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_plans" ADD CONSTRAINT "fk_tbl_plans_tbl_plan_types_plan_type_id" FOREIGN KEY ("plan_type_id") REFERENCES "tbl_plan_types"("plan_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_plans" ADD CONSTRAINT "fk_tbl_plans_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_subscriptions" ADD CONSTRAINT "fk_tbl_subscriptions_tbl_subscription_types_subscription_type_i" FOREIGN KEY ("subscription_type_id") REFERENCES "tbl_subscription_types"("subscription_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_subscriptions" ADD CONSTRAINT "fk_tbl_subscriptions_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" ADD CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_plan_types_plan_type_id" FOREIGN KEY ("plan_type_id") REFERENCES "tbl_plan_types"("plan_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" ADD CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_subscription_types_subsc" FOREIGN KEY ("subscription_type_id") REFERENCES "tbl_subscription_types"("subscription_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_offer_purchase_transactions" ADD CONSTRAINT "fk_tbl_offer_purchase_transactions_tbl_wallets_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
