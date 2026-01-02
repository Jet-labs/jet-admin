/**
 * Dashboard Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createDashboardSchema = z.object({
  dashboardTitle: z.string().min(1, "dashboardTitle is required").max(255),
  dashboardDescription: z.string().optional(),
  dashboardConfig: z.object({}).passthrough(),
}).passthrough();

const updateDashboardSchema = z.object({
  dashboardTitle: z.string().min(1, "dashboardTitle is required").max(255),
  dashboardDescription: z.string().optional(),
  dashboardConfig: z.object({}).passthrough(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const dashboardIdParamSchema = z.object({
  dashboardID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createDashboardSchema,
  updateDashboardSchema,
  dashboardIdParamSchema,
};
