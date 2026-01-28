/**
 * DataQuery Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createDataQuerySchema = z.object({
  dataQueryTitle: z.string().min(1, "dataQueryTitle is required").max(255),
  dataQueryOptions: z.object({}).passthrough(),
  runOnLoad: z.boolean().optional(),
}).passthrough();

const updateDataQuerySchema = z.object({
  dataQueryTitle: z.string().min(1, "dataQueryTitle is required").max(255),
  dataQueryOptions: z.object({}).passthrough(),
  runOnLoad: z.boolean().optional(),
}).passthrough();

const testDataQuerySchema = z.object({
  dataQuery: z.object({}).passthrough(),
  // argValues: z.object({}).optional(),
}).passthrough();

const aiGenerateSchema = z.object({
  aiPrompt: z.string().min(1, "aiPrompt is required"),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const dataQueryIdParamSchema = z.object({
  dataQueryID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createDataQuerySchema,
  updateDataQuerySchema,
  testDataQuerySchema,
  aiGenerateSchema,
  dataQueryIdParamSchema,
};
