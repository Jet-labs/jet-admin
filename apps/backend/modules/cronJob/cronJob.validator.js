/**
 * CronJob Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createCronJobSchema = z.object({
  cronJobTitle: z.string().min(1, "cronJobTitle is required").max(255),
  cronJobDescription: z.string().optional(),
  cronJobSchedule: schemas.cronScheduleSchema,
  cronJobEnabled: z.boolean().optional().default(true),
  cronJobType: z.string().min(1, "cronJobType is required"),
  cronJobConfig: z.object({}).passthrough(),
}).passthrough();

const updateCronJobSchema = z.object({
  cronJobTitle: z.string().min(1).max(255).optional(),
  cronJobDescription: z.string().optional(),
  cronJobSchedule: schemas.cronScheduleSchema.optional(),
  cronJobEnabled: z.boolean().optional(),
  cronJobType: z.string().optional(),
  cronJobConfig: z.object({}).passthrough().optional(),
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

const cronJobHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createCronJobSchema,
  updateCronJobSchema,
  cronJobIdParamSchema,
  cronJobHistoryQuerySchema,
};
