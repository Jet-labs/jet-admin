-- Managed page adoption writes cloned App Page rows owned by one application.
-- Referenced pages remain shared and are never cloned or mutated.

ALTER TABLE "tblApplicationAssets"
  DROP CONSTRAINT IF EXISTS "tblApplicationAssets_managementMode_check";

ALTER TABLE "tblApplicationAssets"
  ADD CONSTRAINT "tblApplicationAssets_managementMode_check"
  CHECK ("managementMode" IN ('referenced', 'managed'));
