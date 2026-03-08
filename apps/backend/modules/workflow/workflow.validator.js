/**
 * Workflow Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const addCustomIssue = (ctx, path, message) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [path],
    message,
  });
};

const createWorkflowSchema = z.object({
  title: z.string().min(1, "workflow title is required").max(255).optional(),
  workflowTitle: z.string().min(1, "workflowTitle is required").max(255).optional(),
  workflowDescription: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowNodes: z.array(z.any()).optional(),
  workflowEdges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.title && !data.workflowTitle) {
    addCustomIssue(ctx, "title", "title is required");
  }
});

const updateWorkflowSchema = z.object({
  title: z.string().min(1, "workflow title is required").max(255).optional(),
  workflowTitle: z.string().min(1, "workflowTitle is required").max(255).optional(),
  workflowDescription: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowNodes: z.array(z.any()).optional(),
  workflowEdges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough();

const executeWorkflowSchema = z.object({
  inputParams: z.object({}).passthrough().optional(),
  args: z.object({}).passthrough().optional(),
}).passthrough();

const testWorkflowSchema = z.object({
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowNodes: z.array(z.any()).optional(),
  workflowEdges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
  inputParams: z.object({}).passthrough().optional(),
  args: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => {
  if (!data.nodes && !data.workflowNodes) {
    addCustomIssue(ctx, "nodes", "nodes are required");
  }

  if (!data.edges && !data.workflowEdges) {
    addCustomIssue(ctx, "edges", "edges are required");
  }
});

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
