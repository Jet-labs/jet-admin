/**
 * Workflow Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const createWorkflowSchema = z.object({
  workflowTitle: z.string().min(1, "workflowTitle is required").max(255),
  workflowDescription: z.string().optional(),
  workflowNodes: z.array(z.any()).optional(),
  workflowEdges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough();

const updateWorkflowSchema = z.object({
  workflowTitle: z.string().min(1, "workflowTitle is required").max(255).optional(),
  workflowDescription: z.string().optional(),
  workflowNodes: z.array(z.any()).optional(),
  workflowEdges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough();

const executeWorkflowSchema = z.object({
  args: z.object({}).passthrough().optional(),
}).passthrough();

const testWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  workflowOptions: z.object({}).passthrough().optional(),
  args: z.object({}).passthrough().optional(),
}).passthrough();

// ============================================================
// URL Param Schemas
// ============================================================

const workflowIdParamSchema = z.object({
  workflowID: schemas.uuidSchema,
}).passthrough();

const instanceIdParamSchema = z.object({
  instanceID: schemas.uuidSchema,
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  testWorkflowSchema,
  workflowIdParamSchema,
  instanceIdParamSchema,
};
