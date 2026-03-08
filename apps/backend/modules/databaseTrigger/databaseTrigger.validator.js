/**
 * DatabaseTrigger Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createTriggerSchema = z.object({
  databaseSchemaName: z.string().optional(),
  databaseTableName: z.string().min(1, "databaseTableName is required"),
  databaseTriggerName: z.string().min(1, "databaseTriggerName is required"),
  triggerTiming: z.string().min(1, "triggerTiming is required"),
  triggerEvents: z.array(z.string()).min(1, "triggerEvents is required"),
  triggerFunctionName: z.string().optional(),
  whenCondition: z.string().optional(),
  forEach: z.string().optional(),
  referencingOld: z.string().optional(),
  referencingNew: z.string().optional(),
  deferrable: z.boolean().optional(),
  initiallyDeferred: z.boolean().optional(),
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
