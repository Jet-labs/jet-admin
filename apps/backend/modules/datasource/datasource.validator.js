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

// Separate JSON-endpoint validation (does NOT alter /test behavior).
// Validates that a restapi baseUrl + testPath serves parseable JSON, not an SPA shell.
const testJsonEndpointSchema = z.object({
  datasourceType: z.string().min(1, "datasourceType is required"),
  datasourceOptions: z.object({}).passthrough(),
  testPath: z.string().min(1, "testPath is required").max(2048),
  testMethod: z.string().optional(),
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
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.paginationSchema).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createDatasourceSchema,
  updateDatasourceSchema,
  testConnectionSchema,
  testJsonEndpointSchema,
  proxyActionSchema,
  datasourceIdParamSchema,
  listDatasourcesQuerySchema,
};
