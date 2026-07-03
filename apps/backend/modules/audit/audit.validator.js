/**
 * Audit Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).passthrough();

module.exports = {
  listAuditLogsQuerySchema,
};
