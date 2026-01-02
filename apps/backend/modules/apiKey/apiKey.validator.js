/**
 * ApiKey Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createApiKeySchema = z.object({
  apiKeyName: z.string().min(1, "apiKeyName is required").max(255),
  apiKeyDescription: z.string().optional(),
  apiKeyPermissions: z.array(z.string()).optional(),
  apiKeyExpiry: z.string().optional(),
}).passthrough();

const updateApiKeySchema = z.object({
  apiKeyName: z.string().min(1).max(255).optional(),
  apiKeyDescription: z.string().optional(),
  apiKeyPermissions: z.array(z.string()).optional(),
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
