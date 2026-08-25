/**
 * Widget Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createWidgetSchema = z.object({
  widgetTitle: z.string().min(1, "widgetTitle is required").max(255),
  widgetDescription: z.string().optional(),
  widgetType: z.string().min(1, "widgetType is required"),
  widgetConfig: z.object({
    properties: z.object({}).passthrough().optional(),
    events: z.object({}).passthrough().optional(),
  }).passthrough(),
}).passthrough();

const updateWidgetSchema = z.object({
  widgetTitle: z.string().min(1).max(255).optional(),
  widgetDescription: z.string().optional(),
  widgetType: z.string().min(1).optional(),
  widgetConfig: z.object({
    properties: z.object({}).passthrough().optional(),
    events: z.object({}).passthrough().optional(),
  }).passthrough().optional(),
}).passthrough();

const testWidgetDataSchema = z.object({
  widgetTitle: z.string().optional(),
  widgetType: z.string().optional(),
  widgetConfig: z.object({
    properties: z.object({}).passthrough().optional(),
    events: z.object({}).passthrough().optional(),
  }).passthrough().optional(),
}).passthrough();

// ============================================================
// URL Param & Query Schemas
// ============================================================

const widgetIdParamSchema = z.object({
  widgetID: schemas.uuidSchema,
}).passthrough();

const listWidgetsQuerySchema = z.object({
  search: z.string().optional(),
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.explorerPaginationSchema).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createWidgetSchema,
  updateWidgetSchema,
  testWidgetDataSchema,
  widgetIdParamSchema,
  listWidgetsQuerySchema,
};
