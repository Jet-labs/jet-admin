/**
 * DatabaseNotification Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createNotificationSchema = z.object({
  notificationName: z.string().min(1, "notificationName is required").max(255),
  notificationChannel: z.string().optional(),
  notificationConfig: z.object({}).passthrough().optional(),
}).passthrough();

const updateNotificationSchema = z.object({
  notificationName: z.string().optional(),
  notificationChannel: z.string().optional(),
  notificationConfig: z.object({}).passthrough().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const notificationIdParamSchema = z.object({
  databaseNotificationID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createNotificationSchema,
  updateNotificationSchema,
  notificationIdParamSchema,
};
