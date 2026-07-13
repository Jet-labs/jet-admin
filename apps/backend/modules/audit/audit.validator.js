/**
 * Audit Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

const listAuditLogsQuerySchema = schemas.paginationSchema.passthrough();

module.exports = {
  listAuditLogsQuerySchema,
};
