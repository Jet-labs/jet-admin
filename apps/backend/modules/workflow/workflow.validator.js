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
        collectTemplateViolations(nodeData?.inputValues, [...nodePath, "inputValues"], issues);
        break;
      case "subWorkflow":
        collectTemplateViolations(nodeData?.inputMapping, [...nodePath, "inputMapping"], issues);
        break;
      case "switch":
        collectTemplateViolations(nodeData?.switchValue, [...nodePath, "switchValue"], issues);
        (nodeData?.cases || []).forEach((c, caseIndex) => {
          if (c && c.operator !== 'expression') {
            collectTemplateViolations(c?.matchValue, [...nodePath, "cases", caseIndex, "matchValue"], issues);
          }
        });
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

const validateOutputVariable = (ctx, nodePath, value) => {
  if (value === undefined || value === null || value === '') return;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    addCustomIssue(ctx, [...nodePath, "outputVariable"], "outputVariable must be a valid JavaScript identifier");
  }
};

// Per-workflow execution policy (tblWorkflows.workflowOptions).
// Precedence at runtime: node.data > workflowOptions(+nodeDefaults) > platform defaults.
const nodePolicySchema = z.object({
  timeoutSeconds: z.number().int().min(1).max(3600).optional(),
  retryLimit: z.number().int().min(0).max(10).optional(),
  retryDelaySeconds: z.number().int().min(0).max(300).optional(),
}).passthrough().optional();

const workflowOptionsSchema = z.object({
  workflowRunTimeout: z.union([z.string().min(1), z.number().positive()]).optional(),
  workflowTaskTimeout: z.union([z.string().min(1), z.number().positive()]).optional(),
  humanInLoopTimeout: z.union([z.string().min(1), z.number().positive()]).optional(),
  defaultNodeTimeoutSeconds: z.number().int().min(1).max(3600).optional(),
  defaultRetryLimit: z.number().int().min(0).max(10).optional(),
  defaultRetryDelaySeconds: z.number().int().min(0).max(300).optional(),
  nodeDefaults: z.record(z.string(), nodePolicySchema).optional(),
}).passthrough().optional();

const ERROR_HANDLING_VALUES = [
  'continue',
  'continue_default',
  'fail_workflow',
  'skip_item',
  'retry_then_fail',
  'retry_then_continue',
];

const addWorkflowNodeConfigIssues = (data, ctx) => {
  if (!data.nodes) return;

  data.nodes.forEach((node, index) => {
    const nodeType = node?.type ?? node?.nodeType;
    const nodeData = node?.data ?? node?.nodeConfig ?? {};
    const nodePath = ["nodes", index, "data"];

    if (nodeData?.errorHandling !== undefined && nodeData.errorHandling !== null && nodeData.errorHandling !== '') {
      if (!ERROR_HANDLING_VALUES.includes(nodeData.errorHandling)) {
        addCustomIssue(ctx, [...nodePath, "errorHandling"], `errorHandling must be one of: ${ERROR_HANDLING_VALUES.join(', ')}`);
      }
    }

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

    if (nodeType === "dataQuery" || nodeType === "javascript" || nodeType === "subWorkflow") {
      validateIntegerRange(ctx, [...nodePath, "timeoutSeconds"], nodeData.timeoutSeconds, 1, 3600, "timeoutSeconds");
      validateIntegerRange(ctx, [...nodePath, "retryLimit"], nodeData.retryLimit, 0, 10, "retryLimit");
      validateIntegerRange(ctx, [...nodePath, "retryDelaySeconds"], nodeData.retryDelaySeconds, 0, 300, "retryDelaySeconds");
    }

    if (nodeType === "subWorkflow") {
      const childID = nodeData.childWorkflowID;
      if (childID !== undefined && childID !== null && childID !== '') {
        try {
          schemas.uuidSchema.parse(childID);
        } catch {
          addCustomIssue(ctx, [...nodePath, "childWorkflowID"], "childWorkflowID must be a valid UUID");
        }
      }
      validateIntegerRange(ctx, [...nodePath, "maxDepth"], nodeData.maxDepth, 1, 10, "maxDepth");
      validateOutputVariable(ctx, nodePath, nodeData.outputVariable);
    }

    if (nodeType === "switch") {
      const cases = nodeData.cases;
      if (cases !== undefined && cases !== null) {
        if (!Array.isArray(cases) || cases.length === 0) {
          addCustomIssue(ctx, [...nodePath, "cases"], "switch requires at least one case");
        } else {
          const seen = new Set();
          cases.forEach((c, caseIndex) => {
            if (!c || !c.id) {
              addCustomIssue(ctx, [...nodePath, "cases", caseIndex, "id"], "case id is required");
            } else if (seen.has(c.id)) {
              addCustomIssue(ctx, [...nodePath, "cases", caseIndex, "id"], "case ids must be unique");
            } else {
              seen.add(c.id);
            }
          });
        }
      }
    }

    if (nodeType === "approval") {
      validateIntegerRange(ctx, [...nodePath, "expiryMinutes"], nodeData.expiryMinutes, 0, 10080, "expiryMinutes");
      if (nodeData.onTimeout !== undefined && nodeData.onTimeout !== null && nodeData.onTimeout !== '' && !['expired', 'fail'].includes(nodeData.onTimeout)) {
        addCustomIssue(ctx, [...nodePath, "onTimeout"], "onTimeout must be expired or fail");
      }
      validateOutputVariable(ctx, nodePath, nodeData.outputVariable);
    }

    if (nodeType === "fanout") {
      const branches = nodeData.branches;
      if (branches !== undefined && branches !== null) {
        if (!Array.isArray(branches) || branches.length === 0) {
          addCustomIssue(ctx, [...nodePath, "branches"], "fan-out requires at least one branch");
        } else {
          const seen = new Set();
          branches.forEach((b, branchIndex) => {
            if (!b || !b.id) {
              addCustomIssue(ctx, [...nodePath, "branches", branchIndex, "id"], "branch id is required");
            } else if (seen.has(b.id)) {
              addCustomIssue(ctx, [...nodePath, "branches", branchIndex, "id"], "branch ids must be unique");
            } else {
              seen.add(b.id);
            }
          });
        }
      }
    }

    if (nodeType === "join") {
      if (nodeData.joinMode !== undefined && nodeData.joinMode !== null && nodeData.joinMode !== '' && !['all', 'any'].includes(nodeData.joinMode)) {
        addCustomIssue(ctx, [...nodePath, "joinMode"], "joinMode must be all or any");
      }
      validateOutputVariable(ctx, nodePath, nodeData.outputVariable);
    }

    if (nodeType === "delay") {      const delayType = nodeData.delayType || "fixed";
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
  workflowOptions: workflowOptionsSchema,
}).passthrough().superRefine((data, ctx) => {
  addWorkflowTemplateIssues(data, ctx);
  addWorkflowNodeConfigIssues(data, ctx);
});

const updateWorkflowSchema = z.object({
  title: z.string().min(1, "workflow title is required").max(255).optional(),
  workflowDescription: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  workflowOptions: workflowOptionsSchema,
}).passthrough().superRefine((data, ctx) => {
  addWorkflowTemplateIssues(data, ctx);
  addWorkflowNodeConfigIssues(data, ctx);
});

const executeWorkflowSchema = z.object({
  inputValues: z.object({}).passthrough().optional(),
}).passthrough();

const testWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  workflowOptions: workflowOptionsSchema,
  inputValues: z.object({}).passthrough().optional(),
  // Optional attribution: test runs launched from a saved workflow editor
  // carry its ID so they show up in that workflow's run history.
  // Still stored as isTest runs; unsaved-graph tests omit it (null).
  workflowID: schemas.uuidSchema.optional(),
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

const listWorkflowsQuerySchema = z.object({
  search: z.string().optional(),
  folderID: schemas.uuidSchema.optional(),
}).merge(schemas.explorerPaginationSchema).passthrough();

const listInstancesQuerySchema = z.object({
  workflowID: schemas.uuidSchema.optional(),
  parentInstanceID: schemas.uuidSchema.optional(),
  status: z.string().optional(),
  // NOTE: z.coerce.boolean() maps "false" -> true (Boolean("false")),
  // so parse the "true"/"false" query strings explicitly instead.
  isTest: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional()
  ),
}).merge(schemas.paginationSchema).passthrough();

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
  listWorkflowsQuerySchema,
  listInstancesQuerySchema,
};
