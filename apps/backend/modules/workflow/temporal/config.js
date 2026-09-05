/**
 * Temporal Configuration — Temporal-only (native engine removed)
 */

const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'jet-admin-workflows';
const NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';

// Activity timeouts & retries — PLATFORM DEFAULTS (lowest precedence).
// Per-workflow overrides live in tblWorkflows.workflowOptions and per-node
// values in node.data. Resolution order (see ./workflowConfig.js):
//   node.data > workflowOptions(+nodeDefaults) > these platform defaults.
// Platform values below are used ONLY when nothing is defined above.
const ACTIVITY_OPTIONS = {
  // Data queries may be long-running + are idempotent via query engine; retry transient failures
  dataQuery: {
    startToCloseTimeout: '2 minutes',
    heartbeatTimeout: '30 seconds',
    retry: { maximumAttempts: 3, initialInterval: '1s', backoffCoefficient: 2, maximumInterval: '10s' },
  },
  // JS sandbox — deterministic timeout via isolated-vm; no retry on logic error
  javascript: {
    startToCloseTimeout: '1 minute',
    retry: { maximumAttempts: 1 },
  },
  // Socket/progress emits are non-idempotent — never retry (Temporal would duplicate socket events)
  emitProgress: {
    startToCloseTimeout: '10 seconds',
    retry: { maximumAttempts: 1 },
  },
  // State / DB writes — idempotent via P2002 guard where applicable
  state: {
    startToCloseTimeout: '30 seconds',
    retry: { maximumAttempts: 3 },
  },
};

const WORKFLOW_OPTIONS = {
  humanInLoopTimeout: process.env.TEMPORAL_HUMAN_TIMEOUT || '24 hours',
  workflowRunTimeout: '7 days',
  // Increased from 10s — dslInterpreter does DB + emitProgress per node, may exceed 5s warning
  workflowTaskTimeout: '30 seconds',
};

// Numeric mirrors of the platform defaults above, for per-node resolution.
// retryLimit = retries AFTER the first attempt (0 == single attempt ==
// Temporal maximumAttempts 1). See ./workflowConfig.js resolveWorkflowConfig.
const DEFAULT_NODE_TIMEOUT_SECONDS = 120;
const DEFAULT_RETRY_LIMIT = 0;
const DEFAULT_RETRY_DELAY_SECONDS = 5;

// Single source of truth for workflow/signal names on the Node side.
// The workflow sandbox (ESM) mirrors these in ./workflows/workflowPolicy.js
// (Temporal workflows cannot require() CJS) — keep values in sync.
const WORKFLOW_TYPE = process.env.TEMPORAL_WORKFLOW_TYPE || 'dslInterpreterWorkflow';
const SIGNALS = {
  SUBMIT_HUMAN_INPUT: 'submitHumanInput',
  CANCEL_WORKFLOW: 'cancelWorkflow',
};

module.exports = {
  TASK_QUEUE,
  NAMESPACE,
  ADDRESS,
  ACTIVITY_OPTIONS,
  WORKFLOW_OPTIONS,
  DEFAULT_NODE_TIMEOUT_SECONDS,
  DEFAULT_RETRY_LIMIT,
  DEFAULT_RETRY_DELAY_SECONDS,
  WORKFLOW_TYPE,
  SIGNALS,
};
