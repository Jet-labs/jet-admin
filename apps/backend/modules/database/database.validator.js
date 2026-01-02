/**
 * Database Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createSchemaSchema = z.object({
  schemaName: z.string().min(1, "schemaName is required").max(255),
}).passthrough();

const executeRawSqlSchema = z.object({
  sql: z.string().min(1, "sql is required"),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const schemaNameParamSchema = z.object({
  databaseSchemaName: z.string().min(1, "databaseSchemaName is required"),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createSchemaSchema,
  executeRawSqlSchema,
  schemaNameParamSchema,
};
