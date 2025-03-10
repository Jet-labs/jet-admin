-- CreateTable
CREATE TABLE "tblTenants" (
    "tenantID" SERIAL NOT NULL,
    "creatorID" INTEGER NOT NULL,
    "ownerID" INTEGER NOT NULL,
    "restaurantName" VARCHAR,
    "isDisabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "disableReason" VARCHAR,

    CONSTRAINT "tblTenants_pkey" PRIMARY KEY ("tenantID")
);

-- CreateTable
CREATE TABLE "tblUsers" (
    "userID" SERIAL NOT NULL,
    "firebaseID" VARCHAR(128) NOT NULL,
    "phoneNumber" VARCHAR,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "address1" VARCHAR,
    "address2" VARCHAR,
    "email" VARCHAR NOT NULL,
    "isDisabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "disableReason" VARCHAR,
    "lastSeen" TIMESTAMPTZ(6),
    "tenantID" INTEGER,

    CONSTRAINT "tblUsers_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "tblTenants" ADD CONSTRAINT "fkCreatorIDUserID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblTenants" ADD CONSTRAINT "fkOwnerIDUserID" FOREIGN KEY ("ownerID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsers" ADD CONSTRAINT "fkTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;
