-- Migration: Hash API keys at rest
-- Converts plaintext apiKey column to sha256 hash + prefix for lookup

-- Step 1: Add apiKeyPrefix column
ALTER TABLE "tblAPIKeys" ADD COLUMN "apiKeyPrefix" VARCHAR(8);

-- Step 2: Populate prefix from existing plaintext keys (first 8 chars)
UPDATE "tblAPIKeys" SET "apiKeyPrefix" = LEFT("apiKey", 8);

-- Step 3: Rename apiKey to apiKeyHash
ALTER TABLE "tblAPIKeys" RENAME COLUMN "apiKey" TO "apiKeyHash";

-- Step 4: Hash all existing plaintext keys (overwrite the column with their SHA-256)
UPDATE "tblAPIKeys" SET "apiKeyHash" = encode(sha256("apiKeyHash"::bytea), 'hex');

-- Step 5: Create index on prefix for fast lookup during auth
CREATE INDEX "idx_tblAPIKeys_apiKeyPrefix" ON "tblAPIKeys" ("apiKeyPrefix");
