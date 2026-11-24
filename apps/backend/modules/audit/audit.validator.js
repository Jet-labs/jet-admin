/**
 * Audit Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

const listAuditLogsQuerySchema = schemas.paginationSchema.passthrough().extend({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(255).optional(),
  entityType: z.string().max(255).optional(),
  compact: z.enum(["true", "false"]).optional(),
});

const exportAuditLogsQuerySchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  dateTo:   z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
}).passthrough();

module.exports = {
  listAuditLogsQuerySchema,
  exportAuditLogsQuerySchema,
};
