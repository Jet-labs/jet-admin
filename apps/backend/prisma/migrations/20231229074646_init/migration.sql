-- CreateTable
CREATE TABLE "tbl_users" (
    "user_id" SERIAL NOT NULL,
    "firebase_id" VARCHAR(128) NOT NULL,
    "phone_number" VARCHAR NOT NULL,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "address1" VARCHAR,
    "address2" VARCHAR,
    "identification_document_id" INTEGER,
    "wallet_id" INTEGER,
    "email" VARCHAR,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "user_type_id" INTEGER NOT NULL,
    "razorpay_customer_id" VARCHAR,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tbl_wallets" (
    "wallet_id" SERIAL NOT NULL,
    "balance" INTEGER DEFAULT 0,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disable_reason" VARCHAR,

    CONSTRAINT "tbl_wallets_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "tbl_user_types" (
    "user_type_id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,

    CONSTRAINT "tbl_user_types_pkey" PRIMARY KEY ("user_type_id")
);

-- CreateTable
CREATE TABLE "tbl_stations" (
    "station_id" SERIAL NOT NULL,
    "address" VARCHAR NOT NULL,
    "pincode" VARCHAR NOT NULL DEFAULT '201301',
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "valid_range" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "max_capacity" INTEGER NOT NULL DEFAULT 20,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "image_urls" VARCHAR,

    CONSTRAINT "tbl_stations_pkey" PRIMARY KEY ("station_id")
);

-- CreateTable
CREATE TABLE "tbl_vehicle_types" (
    "vehicle_type_id" SERIAL NOT NULL,
    "description" VARCHAR,
    "category" VARCHAR,
    "unlock_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_rate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "hour_rate" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "day_rate" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,

    CONSTRAINT "tbl_vehicle_types_pkey" PRIMARY KEY ("vehicle_type_id")
);

-- CreateTable
CREATE TABLE "tbl_vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL DEFAULT 1,
    "vehicle_status" INTEGER NOT NULL DEFAULT 1,
    "battery" INTEGER NOT NULL DEFAULT 100,
    "station_id" INTEGER,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "total_distance_travelled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "vehicle_number" VARCHAR NOT NULL DEFAULT 'mg-123-456',
    "image_urls" VARCHAR,

    CONSTRAINT "tbl_vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "tbl_master" (
    "master_id" SERIAL NOT NULL,
    "ride_id" INTEGER,
    "reservation_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" INTEGER,
    "receipt_id" INTEGER,
    "ride_review_id" INTEGER,

    CONSTRAINT "tbl_master_pkey" PRIMARY KEY ("master_id")
);

-- CreateTable
CREATE TABLE "tbl_rides" (
    "ride_id" SERIAL NOT NULL,
    "ride_status" INTEGER NOT NULL DEFAULT 4,
    "vehicle_id" INTEGER NOT NULL,
    "ride_start_station_id" INTEGER NOT NULL,
    "ride_end_station_id" INTEGER,
    "total_pause_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_pause_at" TIMESTAMPTZ(6),
    "last_resume_at" TIMESTAMPTZ(6),
    "ride_initiation_at" TIMETZ(6),
    "ride_start_at" TIMESTAMPTZ(6),
    "estimated_ride_end_at" TIMESTAMPTZ(6),
    "ride_end_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_rides_pkey" PRIMARY KEY ("ride_id")
);

-- CreateTable
CREATE TABLE "tbl_reservations" (
    "reservation_id" SERIAL NOT NULL,
    "reservation_status" INTEGER NOT NULL DEFAULT 4,
    "vehicle_id" INTEGER NOT NULL,
    "total_pause_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservation_initiation_at" TIMETZ(6),
    "reservation_start_at" TIMESTAMPTZ(6),
    "estimated_reservation_end_at" TIMESTAMPTZ(6),
    "reservation_end_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_reservations_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateTable
CREATE TABLE "tbl_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "transaction_message" VARCHAR(300),
    "transaction_status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_wallet_id" INTEGER NOT NULL,
    "receiver_wallet_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "is_refund" BOOLEAN NOT NULL DEFAULT false,
    "refund_at" TIMESTAMPTZ(6),

    CONSTRAINT "tbl_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_receipts" (
    "receipt_id" SERIAL NOT NULL,
    "total_time" INTEGER NOT NULL,
    "total_ride_time" INTEGER NOT NULL,
    "total_pause_time" INTEGER NOT NULL,
    "vat" INTEGER NOT NULL DEFAULT 0,
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

    CONSTRAINT "tbl_receipts_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "tbl_ride_reviews" (
    "ride_review_id" SERIAL NOT NULL,
    "text" VARCHAR,
    "stars" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_ride_reviews_pkey" PRIMARY KEY ("ride_review_id")
);

-- CreateTable
CREATE TABLE "tbl_payment_orders" (
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "payment_order_id" VARCHAR NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payment_order_status" VARCHAR,
    "offer_id" INTEGER,

    CONSTRAINT "tbl_payment_orders_pkey" PRIMARY KEY ("payment_order_id")
);

-- CreateTable
CREATE TABLE "tbl_payment_transactions" (
    "amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_transaction_status" VARCHAR,
    "payment_transaction_id" VARCHAR NOT NULL,
    "amount_refunded" INTEGER,
    "internal_payment_transaction_id" SERIAL NOT NULL,
    "payment_order_id" VARCHAR NOT NULL,
    "payment_transaction_bank" VARCHAR,
    "payment_transaction_captured" BOOLEAN NOT NULL DEFAULT false,
    "payment_transaction_card" VARCHAR,
    "payment_transaction_card_id" VARCHAR,
    "payment_transaction_email" VARCHAR,
    "payment_transaction_error_code" VARCHAR,
    "payment_transaction_error_description" VARCHAR,
    "payment_transaction_fee" INTEGER,
    "payment_transaction_method" VARCHAR,
    "payment_transaction_tax" INTEGER,
    "payment_transaction_vpa" VARCHAR,
    "payment_transaction_wallet" VARCHAR,
    "refund_status" VARCHAR,

    CONSTRAINT "tbl_payment_transactions_pkey" PRIMARY KEY ("payment_transaction_id")
);

-- CreateTable
CREATE TABLE "tbl_support_tickets" (
    "support_ticket_id" SERIAL NOT NULL,
    "text" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta_key" VARCHAR,
    "closed_at" TIMESTAMPTZ(6),
    "other_json_data" VARCHAR,

    CONSTRAINT "tbl_user_complaints_pkey" PRIMARY KEY ("support_ticket_id")
);

-- CreateIndex
CREATE INDEX "fki_fk_tbl_master_tbl_receipts_receipt_id" ON "tbl_master"("receipt_id");

-- CreateIndex
CREATE INDEX "fki_fk_tbl_master_tbl_transactions_transaction_id" ON "tbl_master"("transaction_id");

-- CreateIndex
CREATE INDEX "fki_fk_tbl_payment_transactions_tbl_users_user_id" ON "tbl_payment_orders"("user_id");

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "fk_tbl_users_tbl_user_types_user_type_id" FOREIGN KEY ("user_type_id") REFERENCES "tbl_user_types"("user_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "fk_tbl_users_tbl_wallets_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_vehicles" ADD CONSTRAINT "fk_tbl_vehicles_tbl_stations_station_id" FOREIGN KEY ("station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_vehicles" ADD CONSTRAINT "fk_tbl_vehicles_tbl_vehicle_types_vehicle_id" FOREIGN KEY ("vehicle_type_id") REFERENCES "tbl_vehicle_types"("vehicle_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_receipts_receipt_id" FOREIGN KEY ("receipt_id") REFERENCES "tbl_receipts"("receipt_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_rides_ride_id" FOREIGN KEY ("ride_id") REFERENCES "tbl_rides"("ride_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_reservations_reservation_id" FOREIGN KEY ("reservation_id") REFERENCES "tbl_reservations"("reservation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_ride_reviews_ride_review_id" FOREIGN KEY ("ride_review_id") REFERENCES "tbl_ride_reviews"("ride_review_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_transactions_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "tbl_transactions"("transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_master" ADD CONSTRAINT "fk_tbl_master_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_rides" ADD CONSTRAINT "fk_tbl_rides_tbl_stations_ride_end_station_id" FOREIGN KEY ("ride_end_station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_rides" ADD CONSTRAINT "fk_tbl_rides_tbl_stations_ride_start_station_id" FOREIGN KEY ("ride_start_station_id") REFERENCES "tbl_stations"("station_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_rides" ADD CONSTRAINT "fk_tbl_rides_tbl_vehicles_vehicle_id" FOREIGN KEY ("vehicle_id") REFERENCES "tbl_vehicles"("vehicle_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_reservations" ADD CONSTRAINT "fk_tbl_reservations_tbl_vehicles_vehicle_id" FOREIGN KEY ("vehicle_id") REFERENCES "tbl_vehicles"("vehicle_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_transactions" ADD CONSTRAINT "fk_tbl_rides_tbl_wallets_receiver_wallet_id" FOREIGN KEY ("receiver_wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_transactions" ADD CONSTRAINT "fk_tbl_rides_tbl_wallets_sender_wallet_id" FOREIGN KEY ("sender_wallet_id") REFERENCES "tbl_wallets"("wallet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_payment_orders" ADD CONSTRAINT "fk_tbl_payment_transactions_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_payment_transactions" ADD CONSTRAINT "fk_tbl_payment_transactions_tbl_payment_order_payment_order_id" FOREIGN KEY ("payment_order_id") REFERENCES "tbl_payment_orders"("payment_order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_support_tickets" ADD CONSTRAINT "fk_tbl_user_complaints_tbl_users_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
