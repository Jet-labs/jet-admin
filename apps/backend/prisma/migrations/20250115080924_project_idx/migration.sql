/*
  Warnings:

  - You are about to drop the column `ownerID` on the `tblTenants` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantName` on the `tblTenants` table. All the data in the column will be lost.
  - You are about to drop the column `tenantID` on the `tblUsers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "user_tenant_roles" AS ENUM ('OWNER', 'CREATOR', 'MEMBER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "tblTenants" DROP CONSTRAINT "fkOwnerIDUserID";

-- DropForeignKey
ALTER TABLE "tblUsers" DROP CONSTRAINT "fkTenantID";

-- AlterTable
ALTER TABLE "tblTenants" DROP COLUMN "ownerID",
DROP COLUMN "restaurantName",
ADD COLUMN     "tenantDBURL" VARCHAR,
ADD COLUMN     "tenantLogoURL" VARCHAR,
ADD COLUMN     "tenantName" VARCHAR,
ALTER COLUMN "creatorID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tblUsers" DROP COLUMN "tenantID";

-- CreateTable
CREATE TABLE "tblUsersTenantsRelationship" (
    "tenantID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "pktblUsersTenantsRelationship" PRIMARY KEY ("tenantID","userID")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniquetblUsersTenantsRelationship" ON "tblUsersTenantsRelationship"("tenantID", "userID");

-- RenameForeignKey
ALTER TABLE "tblTenants" RENAME CONSTRAINT "fkCreatorIDUserID" TO "fktblTenantstblUsersCreatorID";

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;
