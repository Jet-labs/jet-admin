/**
 * CronJob Validation Schemas
 * Aligned with Prisma schema fields
 */

const { z, schemas } = require("../../utils/validation.utils");
const cron = require("node-cron");

// Custom cron schedule validation using node-cron
const cronScheduleValidation = z.string().refine(
  (val) => cron.validate(val),
  { message: "Invalid cron schedule expression" }
);

// ============================================================
// Request Body Schemas
// ============================================================

const createCronJobSchema = z.object({
  cronJobTitle: z.string().min(1, "cronJobTitle is required").max(255),
  cronJobDescription: z.string().optional(),
  cronJobSchedule: cronScheduleValidation,
  workflowID: z.string().uuid("workflowID must be a valid UUID"),
  workflowConfig: z.object({}).passthrough().optional(),
  isDisabled: z.boolean().optional().default(false),
  timeoutSeconds: z.number().int().min(0).optional(),
  retryAttempts: z.number().int().min(0).optional(),
  retryDelaySeconds: z.number().int().min(0).optional(),
}).passthrough();

const updateCronJobSchema = z.object({
  cronJobTitle: z.string().min(1).max(255).optional(),
  cronJobDescription: z.string().optional(),
  cronJobSchedule: cronScheduleValidation.optional(),
  workflowID: z.string().uuid("workflowID must be a valid UUID").optional(),
  workflowConfig: z.object({}).passthrough().optional(),
  isDisabled: z.boolean().optional(),
  timeoutSeconds: z.number().int().min(0).optional().nullable(),
  retryAttempts: z.number().int().min(0).optional().nullable(),
  retryDelaySeconds: z.number().int().min(0).optional().nullable(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const cronJobIdParamSchema = z.object({
  cronJobID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Query Schemas
// ============================================================

const cronJobHistoryQuerySchema = schemas.paginationSchema.passthrough();

const listCronJobsQuerySchema = z.object({
  search: z.string().optional(),
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.explorerPaginationSchema).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createCronJobSchema,
  updateCronJobSchema,
  cronJobIdParamSchema,
  cronJobHistoryQuerySchema,
  listCronJobsQuerySchema,
};
