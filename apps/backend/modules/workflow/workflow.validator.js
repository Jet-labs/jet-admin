/**
 * Workflow Validation Schemas
 */

const { z, schemas } = require("../../utils/validation.utils");
const {
  collectTemplateViolations,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
} = require("@jet-admin/expression-engine");

// ============================================================
// Request Body Schemas
// ============================================================

const addCustomIssue = (ctx, path, message) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: Array.isArray(path) ? path : [path],
    message,
  });
};

const addWorkflowTemplateIssues = (data, ctx) => {
  if (!data.nodes) return;

  const rootPath = ["nodes"];
  const issues = [];

  data.nodes.forEach((node, index) => {
    const nodeType = node?.type ?? node?.nodeType;
    const nodeData = node?.data ?? node?.nodeConfig ?? {};
    const nodePath = [...rootPath, index, "data"];

    switch (nodeType) {
      case "dataQuery":
        collectTemplateViolations(nodeData?.args, [...nodePath, "args"], issues);
        break;
      case "loop":
        collectTemplateViolations(nodeData?.sourceVariable, [...nodePath, "sourceVariable"], issues);
        break;
      case "delay":
        collectTemplateViolations(nodeData?.delayVariable, [...nodePath, "delayVariable"], issues);
        collectTemplateViolations(nodeData?.untilTime, [...nodePath, "untilTime"], issues);
        break;
      case "end":
        (nodeData?.outputParameters || []).forEach((param, paramIndex) => {
          collectTemplateViolations(
            param?.sourceVariable,
            [...nodePath, "outputParameters", paramIndex, "sourceVariable"],
            issues
          );
        });
        break;
      default:
        break;
    }
  });

  for (const issue of issues) {
    addCustomIssue(ctx, issue.path, issue.message);
  }
};

const validateIntegerRange = (ctx, path, value, min, max, label) => {
  if (value === undefined || value === null || value === '') return;
  if (!Number.isInteger(Number(value)) || Number(value) < min || Number(value) > max) {
    addCustomIssue(ctx, path, `${label} must be an integer between ${min} and ${max}`);
  }
};

const addWorkflowNodeConfigIssues = (data, ctx) => {
  if (!data.nodes) return;

  data.nodes.forEach((node, index) => {
    const nodeType = node?.type ?? node?.nodeType;
    const nodeData = node?.data ?? node?.nodeConfig ?? {};
    const nodePath = ["nodes", index, "data"];

    if (nodeType === "loop") {
      validateIntegerRange(ctx, [...nodePath, "maxIterations"], nodeData.maxIterations, 1, 100000, "maxIterations");
      validateIntegerRange(ctx, [...nodePath, "delayBetweenItems"], nodeData.delayBetweenItems, 0, 60000, "delayBetweenItems");

      for (const variableField of ["itemVariable", "indexVariable"]) {
        const value = nodeData?.[variableField];
        if (value && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          addCustomIssue(ctx, [...nodePath, variableField], `${variableField} must be a valid JavaScript identifier`);
        }
      }
    }

    if (nodeType === "delay") {
      const delayType = nodeData.delayType || "fixed";
      if (!["fixed", "dynamic", "until"].includes(delayType)) {
        addCustomIssue(ctx, [...nodePath, "delayType"], "delayType must be fixed, dynamic, or until");
      }
      validateIntegerRange(ctx, [...nodePath, "delayMs"], nodeData.delayMs, 0, 999, "delayMs");
      validateIntegerRange(ctx, [...nodePath, "delaySeconds"], nodeData.delaySeconds, 0, 59, "delaySeconds");
      validateIntegerRange(ctx, [...nodePath, "delayMinutes"], nodeData.delayMinutes, 0, 1440, "delayMinutes");
      if (delayType === "dynamic" && !nodeData.delayVariable) {
        addCustomIssue(ctx, [...nodePath, "delayVariable"], "delayVariable is required for dynamic delays");
      }
      if (delayType === "until" && !nodeData.untilTime) {
        addCustomIssue(ctx, [...nodePath, "untilTime"], "untilTime is required for until delays");
      }
    }
  });
};

const createWorkflowSchema = z.object({
  title: z.string().min(1, "workflow title is required").max(255),
  workflowDescription: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => {
  addWorkflowTemplateIssues(data, ctx);
  addWorkflowNodeConfigIssues(data, ctx);
});

const updateWorkflowSchema = z.object({
  title: z.string().min(1, "workflow title is required").max(255).optional(),
  workflowDescription: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowOptions: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => {
  addWorkflowTemplateIssues(data, ctx);
  addWorkflowNodeConfigIssues(data, ctx);
});

const executeWorkflowSchema = z.object({
  inputArgs: z.object({}).passthrough().optional(),
}).passthrough();

const testWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  workflowOptions: z.object({}).passthrough().optional(),
  inputArgs: z.object({}).passthrough().optional(),
}).passthrough().superRefine((data, ctx) => {
  addWorkflowTemplateIssues(data, ctx);
  addWorkflowNodeConfigIssues(data, ctx);
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
