const { z, schemas } = require("../../utils/validation.utils");

const BUNDLE_VERSION = 1;

const BUNDLE_ITEM_TYPES = [
  "appPage",
  "widget",
  "workflow",
  "dataQuery",
  "datasource",
  "listener",
];

const bundleDependencySchema = z.object({
  type: z.enum(BUNDLE_ITEM_TYPES),
  id: schemas.uuidSchema,
  name: z.string().optional(),
  bundled: z.boolean().optional(),
});

const bundleItemSchema = z.object({
  type: z.enum(BUNDLE_ITEM_TYPES),
  id: schemas.uuidSchema,
  payload: z.object({}).passthrough(),
  dependencies: z.array(bundleDependencySchema).optional(),
});

const bundleSchema = z.object({
  bundleVersion: z.literal(BUNDLE_VERSION, {
    errorMap: () => ({ message: `Unsupported bundleVersion. Expected ${BUNDLE_VERSION}.` }),
  }),
  generator: z.string().optional(),
  exportedAt: z.string().optional(),
  sourceTenant: schemas.uuidSchema.optional(),
  items: z.array(bundleItemSchema).min(1, "Bundle must contain at least one item"),
});

const importPreviewSchema = z.object({
  bundle: bundleSchema,
}).passthrough();

const importExecuteSchema = z.object({
  bundle: bundleSchema,
}).passthrough();

module.exports = {
  BUNDLE_VERSION,
  BUNDLE_ITEM_TYPES,
  bundleSchema,
  bundleItemSchema,
  bundleDependencySchema,
  importPreviewSchema,
  importExecuteSchema,
};
