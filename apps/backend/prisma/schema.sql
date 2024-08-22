-- CreateEnum
CREATE TYPE "mpaa_rating" AS ENUM ('G', 'PG', 'PG-13', 'R', 'NC-17');

-- CreateTable
CREATE TABLE "actor" (
    "actor_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actor_pkey" PRIMARY KEY ("actor_id")
);

-- CreateTable
CREATE TABLE "address" (
    "address_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "address2" TEXT,
    "district" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "postal_code" TEXT,
    "phone" TEXT NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "city" (
    "city_id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "country" (
    "country_id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "country_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "address_id" INTEGER NOT NULL,
    "activebool" BOOLEAN NOT NULL DEFAULT true,
    "create_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "last_update" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "active" INTEGER,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "film" (
    "film_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "release_year" INTEGER,
    "language_id" INTEGER NOT NULL,
    "original_language_id" INTEGER,
    "rental_duration" SMALLINT NOT NULL DEFAULT 3,
    "rental_rate" DECIMAL(4,2) NOT NULL DEFAULT 4.99,
    "length" SMALLINT,
    "replacement_cost" DECIMAL(5,2) NOT NULL DEFAULT 19.99,
    "rating" "mpaa_rating" DEFAULT 'G',
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "special_features" TEXT[],
    "fulltext" tsvector NOT NULL,

    CONSTRAINT "film_pkey" PRIMARY KEY ("film_id")
);

-- CreateTable
CREATE TABLE "film_actor" (
    "actor_id" INTEGER NOT NULL,
    "film_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_actor_pkey" PRIMARY KEY ("actor_id","film_id")
);

-- CreateTable
CREATE TABLE "film_category" (
    "film_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_category_pkey" PRIMARY KEY ("film_id","category_id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "inventory_id" SERIAL NOT NULL,
    "film_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "language" (
    "language_id" SERIAL NOT NULL,
    "name" CHAR(20) NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "language_pkey" PRIMARY KEY ("language_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "rental_id" INTEGER NOT NULL,
    "amount" DECIMAL(5,2) NOT NULL,
    "payment_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("payment_date","payment_id")
);

-- CreateTable
CREATE TABLE "rental" (
    "rental_id" SERIAL NOT NULL,
    "rental_date" TIMESTAMPTZ(6) NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "return_date" TIMESTAMPTZ(6),
    "staff_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_pkey" PRIMARY KEY ("rental_id")
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "address_id" INTEGER NOT NULL,
    "email" TEXT,
    "store_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" BYTEA,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "store" (
    "store_id" SERIAL NOT NULL,
    "manager_staff_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_policy_objects" (
    "pm_policy_object_id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "policy" JSONB,

    CONSTRAINT "tbl_pm_policy_objects_pkey" PRIMARY KEY ("pm_policy_object_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_users" (
    "pm_user_id" SERIAL NOT NULL,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "address1" VARCHAR,
    "pm_policy_object_id" INTEGER,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "username" VARCHAR,
    "password_hash" VARCHAR,
    "salt" VARCHAR,

    CONSTRAINT "tbl_pm_users_pkey" PRIMARY KEY ("pm_user_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_graphs" (
    "pm_graph_id" SERIAL NOT NULL,
    "pm_graph_title" VARCHAR NOT NULL,
    "graph_description" VARCHAR,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "graph_options" JSONB,

    CONSTRAINT "tbl_pm_graphs_pkey" PRIMARY KEY ("pm_graph_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_dashboards" (
    "pm_dashboard_id" SERIAL NOT NULL,
    "dashboard_title" VARCHAR NOT NULL,
    "dashboard_description" VARCHAR,
    "is_disabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "disable_reason" VARCHAR,
    "dashboard_options" JSONB,
    "dashboard_graph_ids" INTEGER[],

    CONSTRAINT "tbl_pm_dashboard_layout_pkey" PRIMARY KEY ("pm_dashboard_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_data_sources" (
    "pm_data_source_id" SERIAL NOT NULL,
    "pm_data_source_title" VARCHAR NOT NULL,
    "pm_query_ids" INTEGER[],
    "pm_data_source_type" VARCHAR DEFAULT 'postgres',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "is_disabled" BOOLEAN DEFAULT false,

    CONSTRAINT "tbl_pm_data_sources_pk" PRIMARY KEY ("pm_data_source_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_queries" (
    "pm_query_id" SERIAL NOT NULL,
    "pm_query_type" VARCHAR DEFAULT 'POSTGRE_QUERY',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "is_disabled" BOOLEAN DEFAULT false,
    "pm_query_title" VARCHAR NOT NULL DEFAULT 'Untitled',
    "pm_query_description" VARCHAR,
    "pm_query" JSON,
    "run_on_load" BOOLEAN,

    CONSTRAINT "tbl_pm_queries_pk" PRIMARY KEY ("pm_query_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_jobs" (
    "pm_job_id" SERIAL NOT NULL,
    "pm_job_title" VARCHAR NOT NULL,
    "pm_query_id" INTEGER NOT NULL,
    "pm_job_schedule" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "is_disabled" BOOLEAN DEFAULT false,

    CONSTRAINT "tbl_pm_jobs_pk" PRIMARY KEY ("pm_job_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_job_history" (
    "pm_job_history_id" SERIAL NOT NULL,
    "history_result" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "is_disabled" BOOLEAN DEFAULT false,
    "pm_job_id" INTEGER NOT NULL,

    CONSTRAINT "tbl_pm_job_histors_pk" PRIMARY KEY ("pm_job_history_id")
);

-- CreateTable
CREATE TABLE "tbl_pm_app_constants" (
    "pm_app_constant_id" SERIAL NOT NULL,
    "pm_app_constant_title" VARCHAR NOT NULL,
    "pm_app_constant_value" JSON NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMPTZ(6),
    "is_disabled" BOOLEAN DEFAULT false,
    "is_internal" BOOLEAN,

    CONSTRAINT "tbl_pm_app_constants_pk" PRIMARY KEY ("pm_app_constant_id")
);

-- CreateIndex
CREATE INDEX "idx_actor_last_name" ON "actor"("last_name");

-- CreateIndex
CREATE INDEX "idx_fk_city_id" ON "address"("city_id");

-- CreateIndex
CREATE INDEX "idx_fk_country_id" ON "city"("country_id");

-- CreateIndex
CREATE INDEX "idx_fk_address_id" ON "customer"("address_id");

-- CreateIndex
CREATE INDEX "idx_fk_store_id" ON "customer"("store_id");

-- CreateIndex
CREATE INDEX "idx_last_name" ON "customer"("last_name");

-- CreateIndex
CREATE INDEX "film_fulltext_idx" ON "film" USING GIST ("fulltext");

-- CreateIndex
CREATE INDEX "idx_fk_language_id" ON "film"("language_id");

-- CreateIndex
CREATE INDEX "idx_fk_original_language_id" ON "film"("original_language_id");

-- CreateIndex
CREATE INDEX "idx_title" ON "film"("title");

-- CreateIndex
CREATE INDEX "idx_fk_film_id" ON "film_actor"("film_id");

-- CreateIndex
CREATE INDEX "idx_store_id_film_id" ON "inventory"("store_id", "film_id");

-- CreateIndex
CREATE INDEX "idx_fk_inventory_id" ON "rental"("inventory_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unq_rental_rental_date_inventory_id_customer_id" ON "rental"("rental_date", "inventory_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unq_manager_staff_id" ON "store"("manager_staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_app_constants_title" ON "tbl_pm_app_constants"("pm_app_constant_title");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film" ADD CONSTRAINT "film_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("language_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film" ADD CONSTRAINT "film_original_language_id_fkey" FOREIGN KEY ("original_language_id") REFERENCES "language"("language_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film_actor" ADD CONSTRAINT "film_actor_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actor"("actor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film_actor" ADD CONSTRAINT "film_actor_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "film"("film_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film_category" ADD CONSTRAINT "film_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "film_category" ADD CONSTRAINT "film_category_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "film"("film_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "film"("film_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental" ADD CONSTRAINT "rental_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental" ADD CONSTRAINT "rental_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental" ADD CONSTRAINT "rental_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("store_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_pm_users" ADD CONSTRAINT "fk_tbl_pm_users_tbl_pm_policy_object_pm_policy_onject_id" FOREIGN KEY ("pm_policy_object_id") REFERENCES "tbl_pm_policy_objects"("pm_policy_object_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_pm_jobs" ADD CONSTRAINT "tbl_pm_jobs_tbl_pm_queries_fk" FOREIGN KEY ("pm_query_id") REFERENCES "tbl_pm_queries"("pm_query_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tbl_pm_job_history" ADD CONSTRAINT "tbl_pm_job_history_tbl_pm_jobs_fk" FOREIGN KEY ("pm_job_id") REFERENCES "tbl_pm_jobs"("pm_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

