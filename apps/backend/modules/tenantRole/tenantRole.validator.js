/**
 * TenantRole Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createRoleSchema = z.object({
  roleTitle: z.string().min(1, "roleTitle is required").max(255),
  roleDescription: z.string().optional(),
  permissionIDs: z.array(z.string()).optional(),
  assetPermissions: z.array(
    z.object({
      resourceType: z.string(),
      resourceID: z.string(),
      action: z.string(),
    })
  ).optional(),
}).passthrough();

const updateRoleSchema = z.object({
  roleTitle: z.string().min(1).max(255).optional(),
  roleDescription: z.string().optional(),
  permissionIDs: z.array(z.string()).optional(),
  assetPermissions: z.array(
    z.object({
      resourceType: z.string(),
      resourceID: z.string(),
      action: z.string(),
    })
  ).optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const roleIdParamSchema = z.object({
  roleID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
};
