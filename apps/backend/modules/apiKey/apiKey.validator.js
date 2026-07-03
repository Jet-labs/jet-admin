/**
 * ApiKey Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createApiKeySchema = z.object({
  apiKeyTitle: z.string().min(1, "apiKeyTitle is required").max(255),
  apiKeyDescription: z.string().optional(),
  roleIDs: z.array(schemas.uuidSchema).optional(),
  apiKeyExpiry: z.string().optional(),
}).passthrough();

const updateApiKeySchema = z.object({
  apiKeyTitle: z.string().min(1).max(255).optional(),
  apiKeyDescription: z.string().optional(),
  roleIDs: z.array(schemas.uuidSchema).optional(),
  apiKeyExpiry: z.string().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const apiKeyIdParamSchema = z.object({
  apiKeyID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createApiKeySchema,
  updateApiKeySchema,
  apiKeyIdParamSchema,
};
