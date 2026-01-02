/**
 * Datasource Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createDatasourceSchema = z.object({
  datasourceTitle: z.string().min(1, "datasourceTitle is required").max(255),
  datasourceType: z.string().min(1, "datasourceType is required"),
  datasourceOptions: z.object({}).passthrough(),
}).passthrough();

const updateDatasourceSchema = z.object({
  datasourceTitle: z.string().min(1, "datasourceTitle is required").max(255),
  datasourceType: z.string().min(1, "datasourceType is required"),
  datasourceOptions: z.object({}).passthrough(),
}).passthrough();

const testConnectionSchema = z.object({
  datasourceType: z.string().min(1, "datasourceType is required"),
  datasourceOptions: z.object({}).passthrough(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const datasourceIdParamSchema = z.object({
  datasourceID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createDatasourceSchema,
  updateDatasourceSchema,
  testConnectionSchema,
  datasourceIdParamSchema,
};
