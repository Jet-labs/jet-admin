-- Migration: Make creatorID nullable for API key creation support
-- This allows resources to be created by API keys without a human user

-- 1. Drop existing foreign key constraints
ALTER TABLE "tblDatasources" DROP CONSTRAINT IF EXISTS "fkTblDatasourceTblUsersCreatorID";
ALTER TABLE "tblTenants" DROP CONSTRAINT IF EXISTS "fktblTenantstblUsersCreatorID";
ALTER TABLE "tblAPIKeys" DROP CONSTRAINT IF EXISTS "fkTblAPIKeysCreatorID";

-- 2. Make creatorID nullable
ALTER TABLE "tblDatasources" ALTER COLUMN "creatorID" DROP NOT NULL;
ALTER TABLE "tblTenants" ALTER COLUMN "creatorID" DROP NOT NULL;
ALTER TABLE "tblAPIKeys" ALTER COLUMN "creatorID" DROP NOT NULL;

-- 3. Re-add foreign key constraints with ON DELETE SET NULL
ALTER TABLE "tblDatasources" 
ADD CONSTRAINT "fkTblDatasourceTblUsersCreatorID" 
FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblTenants" 
ADD CONSTRAINT "fktblTenantstblUsersCreatorID" 
FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblAPIKeys" 
ADD CONSTRAINT "fkTblAPIKeysCreatorID" 
FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") 
ON DELETE SET NULL ON UPDATE NO ACTION;
