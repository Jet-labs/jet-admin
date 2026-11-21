/**
 * Widget Validation Schemas
 *
 * Type/config validation is enforced against the canonical widget
 * descriptors (F04/B08): unknown widget types are rejected, saved configs
 * are normalized to their canonical shape (legacy aliases migrated), and
 * structural problems surface as structured field errors. Unknown config
 * keys and declared-but-unsupported events pass through (never dropped).
 */

const { z, schemas } = require("../../utils/validation.utils");
const {
  normalizeWidgetConfig,
  validateWidgetConfig,
  getWidgetDescriptor,
} = require("@jet-admin/widget-types");

const widgetConfigShape = z.object({
  properties: z.object({}).passthrough().optional(),
  events: z.object({}).passthrough().optional(),
}).passthrough();

/**
 * Authoring-time contract check + canonical normalization for one
 * { widgetType, widgetConfig } pair. Runs inside zod refinements/transforms
 * (request validation) and in the service layer (update-without-type, where
 * the effective type comes from the stored row).
 */
const checkWidgetContract = (widgetType, widgetConfig, ctx) => {
  if (widgetType === undefined) return;
  if (!getWidgetDescriptor(widgetType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["widgetType"],
      message: `Unknown widgetType '${widgetType}'. Use the 32 registered types (see get_widget_schemas).`,
      params: { code: "unknown-type" },
    });
    return;
  }
  if (widgetConfig === undefined) return;
  const result = validateWidgetConfig(widgetType, widgetConfig, { mode: "authoring" });
  for (const err of result.errors) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["widgetConfig", ...(err.field ? String(err.field).split(".") : [])],
      message: err.message,
      params: { code: err.code },
    });
  }
};

const normalizeWidgetInput = (val) => {
  if (
    val &&
    typeof val.widgetType === "string" &&
    val.widgetConfig !== undefined &&
    getWidgetDescriptor(val.widgetType)
  ) {
    const { config } = normalizeWidgetConfig(val.widgetType, val.widgetConfig);
    return { ...val, widgetConfig: config };
  }
  return val;
};

// ============================================================
// Request Body Schemas
// ============================================================

const createWidgetSchema = z.object({
  widgetTitle: z.string().min(1, "widgetTitle is required").max(255),
  widgetDescription: z.string().optional(),
  widgetType: z.string().min(1, "widgetType is required"),
  widgetConfig: widgetConfigShape,
}).passthrough()
  .superRefine((val, ctx) => checkWidgetContract(val.widgetType, val.widgetConfig, ctx))
  .transform(normalizeWidgetInput);

const updateWidgetSchema = z.object({
  widgetTitle: z.string().min(1).max(255).optional(),
  widgetDescription: z.string().optional(),
  widgetType: z.string().min(1).optional(),
  widgetConfig: widgetConfigShape.optional(),
}).passthrough()
  .superRefine((val, ctx) => checkWidgetContract(val.widgetType, val.widgetConfig, ctx))
  .transform(normalizeWidgetInput);

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
