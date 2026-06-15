/**
 * AppPage Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createAppPageSchema = z.object({
  appPageTitle: z.string().min(1, "appPageTitle is required").max(255),
  appPageDescription: z.string().optional(),
  appPageConfig: z.object({}).passthrough(),
}).passthrough();

const updateAppPageSchema = z.object({
  appPageTitle: z.string().min(1, "appPageTitle is required").max(255),
  appPageDescription: z.string().optional(),
  appPageConfig: z.object({}).passthrough(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const appPageIdParamSchema = z.object({
  appPageID: schemas.uuidSchema,
}).passthrough();

const listAppPagesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createAppPageSchema,
  updateAppPageSchema,
  appPageIdParamSchema,
  listAppPagesQuerySchema,
};
