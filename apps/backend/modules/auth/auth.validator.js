/**
 * Auth Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const updateConfigSchema = z.object({
  config: z.object({}).passthrough(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const tenantIdParamSchema = z.object({
  tenantID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  updateConfigSchema,
  tenantIdParamSchema,
};
