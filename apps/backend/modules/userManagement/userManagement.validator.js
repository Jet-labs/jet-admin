/**
 * UserManagement Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const addUserToTenantSchema = z.object({
  userEmail: schemas.emailSchema,
  roleIDs: z.array(schemas.uuidSchema).optional(),
}).passthrough();

const updateUserRolesSchema = z.object({
  roleIDs: z.array(schemas.uuidSchema),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const tenantUserIdParamSchema = z.object({
  tenantUserID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  addUserToTenantSchema,
  updateUserRolesSchema,
  tenantUserIdParamSchema,
};
