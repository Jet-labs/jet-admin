/**
 * DatabaseTrigger Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createTriggerSchema = z.object({
  databaseTableName: z.string().min(1, "databaseTableName is required"),
  databaseTriggerName: z.string().min(1, "databaseTriggerName is required"),
  triggerTiming: z.string().min(1, "triggerTiming is required"),
  triggerEvents: z.string().min(1, "triggerEvents is required"),
  triggerFunction: z.string().optional(),
  triggerCondition: z.string().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const triggerParamSchema = z.object({
  databaseTableName: z.string().min(1, "databaseTableName is required"),
  databaseTriggerName: z.string().min(1, "databaseTriggerName is required"),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createTriggerSchema,
  triggerParamSchema,
};
