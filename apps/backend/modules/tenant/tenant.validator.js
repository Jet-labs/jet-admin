/**
 * Tenant Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createTenantSchema = z.object({
  tenantTitle: z.string().min(1, "tenantTitle is required").max(255),
  tenantDescription: z.string().optional(),
  tenantDatabaseConnectionURL: z.string().min(1, "tenantDatabaseConnectionURL is required"),
}).passthrough();

const updateTenantSchema = z.object({
  tenantTitle: z.string().optional(),
  tenantDescription: z.string().optional(),
  tenantDatabaseConnectionURL: z.string().optional(),
}).passthrough();

const testDbConnectionSchema = z.object({
  tenantDatabaseConnectionURL: z.string().min(1, "tenantDatabaseConnectionURL is required"),
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
  createTenantSchema,
  updateTenantSchema,
  testDbConnectionSchema,
  tenantIdParamSchema,
};
