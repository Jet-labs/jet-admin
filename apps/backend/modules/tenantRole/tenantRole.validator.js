/**
 * TenantRole Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createRoleSchema = z.object({
  roleName: z.string().min(1, "roleName is required").max(255),
  roleDescription: z.string().optional(),
  rolePermissions: z.array(z.string()),
}).passthrough();

const updateRoleSchema = z.object({
  roleName: z.string().min(1).max(255).optional(),
  roleDescription: z.string().optional(),
  rolePermissions: z.array(z.string()).optional(),
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
