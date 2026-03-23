/**
 * DataQuery Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");
const { collectTemplateViolations } = require("../../utils/templateEngine/validator");

const addCustomIssue = (ctx, path, message) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: Array.isArray(path) ? path : [path],
    message,
  });
};

const addDataQueryTemplateIssues = (data, ctx) => {
  if (!data.dataQueryOptions) return;

  const issues = [];
  collectTemplateViolations(data.dataQueryOptions, ["dataQueryOptions"], issues);

  for (const issue of issues) {
    addCustomIssue(ctx, issue.path, issue.message);
  }
};

// ============================================================
// Request Body Schemas
// ============================================================

const createDataQuerySchema = z.object({
  dataQueryTitle: z.string().min(1, "dataQueryTitle is required").max(255),
  dataQueryOptions: z.object({}).passthrough(),
  runOnLoad: z.boolean().optional(),
}).passthrough().superRefine((data, ctx) => {
  addDataQueryTemplateIssues(data, ctx);
});

const updateDataQuerySchema = z.object({
  dataQueryTitle: z.string().min(1, "dataQueryTitle is required").max(255),
  dataQueryOptions: z.object({}).passthrough(),
  runOnLoad: z.boolean().optional(),
}).passthrough().superRefine((data, ctx) => {
  addDataQueryTemplateIssues(data, ctx);
});

const testDataQuerySchema = z.object({
  dataQuery: z.object({}).passthrough(),
  inputArgs: z.object({}).passthrough().optional(),
}).passthrough();

const runDataQueryByIDSchema = z.object({
  inputArgs: z.object({}).passthrough().optional(),
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
  runDataQueryByIDSchema,
  aiGenerateSchema,
  dataQueryIdParamSchema,
};
