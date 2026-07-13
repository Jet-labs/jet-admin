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

const proxyActionSchema = z.object({
  action: z.string().min(1, "action is required"),
  params: z.object({}).passthrough().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const datasourceIdParamSchema = z.object({
  datasourceID: schemas.uuidSchema,
}).passthrough();

const listDatasourcesQuerySchema = z.object({
  search: z.string().optional(),
}).merge(schemas.paginationSchema).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createDatasourceSchema,
  updateDatasourceSchema,
  testConnectionSchema,
  proxyActionSchema,
  datasourceIdParamSchema,
  listDatasourcesQuerySchema,
};
