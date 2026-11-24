/**
 * AppPage Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

const LAYOUT_NODE_TYPES = ["column", "row", "widget", "container", "stack", "z-stack"];

function addAppPageConfigIssues(config, ctx) {
  if (!config || typeof config !== "object") return;
  // Only enforce V2 structure. Legacy pages may carry a `layout`-ish object
  // with a different shape; rejecting those would break existing tenants.
  if (config.layoutVersion !== 2) return;
  const layout = config.layout;
  if (!layout) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["appPageConfig", "layout"],
      message: "layout is required for V2 app pages",
    });
    return;
  }
  if (layout.type !== "column") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["appPageConfig", "layout", "type"],
      message: 'V2 layout root must be type "column"',
    });
  }

  const widgets = Array.isArray(config.widgets) ? config.widgets : [];
  const walk = (node, path) => {
    if (!node || typeof node !== "object") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: "layout node must be an object" });
      return;
    }
    if (!LAYOUT_NODE_TYPES.includes(node.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...path, "type"],
        message: `layout node type must be one of: ${LAYOUT_NODE_TYPES.join(", ")}`,
      });
      return;
    }
    if (node.type === "widget") {
      if (typeof node.widgetKey !== "string" || !node.widgetKey) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...path, "widgetKey"], message: "widget node requires widgetKey" });
      } else if (widgets.length && !widgets.includes(node.widgetKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, "widgetKey"],
          message: `${node.widgetKey} is not present in widgets[]`,
        });
      }
      if (node.span !== undefined && (!Number.isInteger(node.span) || node.span < 1 || node.span > 12)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...path, "span"], message: "widget span must be an integer 1-12" });
      }
      return;
    }
    if (node.children !== undefined && !Array.isArray(node.children)) {
      // Legacy/odd containers exist in stored pages; do not reject them.
      return;
    }
    (node.children || []).forEach((child, index) => walk(child, [...path, "children", index]));
  };
  walk(layout, ["appPageConfig", "layout"]);

  if (Array.isArray(config.dataSources)) {
    config.dataSources.forEach((source, index) => {
      if (!source || typeof source !== "object") return;
      if (source.type !== undefined && !["query", "workflow", "listener"].includes(source.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["appPageConfig", "dataSources", index, "type"], message: "data source type must be query, workflow, or listener" });
      }
    });
  }
}

const createAppPageSchema = z.object({
  appPageTitle: z.string().min(1, "appPageTitle is required").max(255),
  appPageDescription: z.string().optional(),
  appPageConfig: z.object({}).passthrough(),
}).passthrough().superRefine((data, ctx) => addAppPageConfigIssues(data.appPageConfig, ctx));

const updateAppPageSchema = z.object({
  // PATCH semantics: every field is optional; the service updates only what
  // was supplied (title-only renames, config-only saves, etc.).
  appPageTitle: z.string().min(1, "appPageTitle is required").max(255).optional(),
  appPageDescription: z.string().optional(),
  appPageConfig: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => addAppPageConfigIssues(data.appPageConfig, ctx));

// ============================================================
// URL Param Schemas
// ============================================================

const appPageIdParamSchema = z.object({
  appPageID: schemas.uuidSchema,
}).passthrough();

const listAppPagesQuerySchema = z.object({
  search: z.string().optional(),
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.explorerPaginationSchema).passthrough();

const appPageVersionIdParamSchema = z.object({
  appPageID: schemas.uuidSchema,
  versionID: schemas.uuidSchema,
}).passthrough();

const listAppPageVersionsQuerySchema = z.object({})
  .merge(schemas.explorerPaginationSchema).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createAppPageSchema,
  updateAppPageSchema,
  appPageIdParamSchema,
  listAppPagesQuerySchema,
  appPageVersionIdParamSchema,
  listAppPageVersionsQuerySchema,
};
