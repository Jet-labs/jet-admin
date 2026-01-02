/**
 * Audit Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Query Schemas
// ============================================================

const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userID: z.string().uuid().optional(),
  action: z.string().optional(),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  auditLogsQuerySchema,
};
