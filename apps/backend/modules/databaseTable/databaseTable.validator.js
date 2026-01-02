/**
 * DatabaseTable Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createTableSchema = z.object({
  databaseTableName: z.string().min(1, "databaseTableName is required").max(255),
  columns: z.array(z.any()).optional(),
}).passthrough();

const updateTableSchema = z.object({
  columns: z.array(z.any()).optional(),
  constraints: z.array(z.any()).optional(),
}).passthrough();

const bulkRowSchema = z.object({
  databaseTableRowData: z.array(z.object({}).passthrough()),
}).passthrough();

const deleteRowsSchema = z.object({
  rowKeys: z.array(z.any()).optional(),
  query: z.object({}).passthrough().optional(),
}).passthrough();

const exportRowsSchema = z.object({
  format: z.enum(["csv", "json", "excel"]).optional(),
  columns: z.array(z.string()).optional(),
  query: z.object({}).passthrough().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const tableNameParamSchema = z.object({
  databaseTableName: z.string().min(1, "databaseTableName is required"),
}).passthrough();

// ============================================================
// Query Schemas
// ============================================================

const tableRowsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).optional().default(100),
  orderBy: z.string().optional(),
  orderDirection: z.enum(["asc", "desc"]).optional(),
  filters: z.string().optional(),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createTableSchema,
  updateTableSchema,
  bulkRowSchema,
  deleteRowsSchema,
  exportRowsSchema,
  tableNameParamSchema,
  tableRowsQuerySchema,
};
