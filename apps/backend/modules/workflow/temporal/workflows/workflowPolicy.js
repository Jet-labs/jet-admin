/**
 * Workflow Policy — deterministic mirror of ../workflowConfig.js
 *
 * Runs INSIDE the Temporal workflow sandbox: pure functions only.
 * No Node APIs, no process.env, no Date, no randomness.
 *
 * Precedence: node.data > workflowConfig.nodeDefaults[type] >
 * workflowConfig.defaults > platform defaults below.
 *
 * KEEP IN SYNC with ../policyDefaults.json (canonical PLATFORM_* + LIMITS).
 * ../workflowConfig.js requires that JSON directly; this file mirrors it
 * because the Temporal sandbox cannot require() CJS with process.env.
 * Parity is enforced by __tests__/unit/workflow/temporalPolicyParity.test.js.
 * Also keep WORKFLOW_TYPE/SIGNALS in sync with ../config.js.
 */

// Mirrors ../config.js WORKFLOW_TYPE / SIGNALS (sandbox cannot require CJS).
export const WORKFLOW_TYPE = 'dslInterpreterWorkflow';
export const SIGNALS = {
  SUBMIT_HUMAN_INPUT: 'submitHumanInput',
  CANCEL_WORKFLOW: 'cancelWorkflow',
};

// Workflow progress statuses emitted via emitProgressActivity.
// Uppercase by convention (activities accept both cases for back-compat).
export const WORKFLOW_PROGRESS = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  SUSPENDED: 'SUSPENDED',
};

// Mirrors @jet-admin/workflow-nodes-logic ERROR_HANDLING (sandbox cannot
// import the Node package). Keep in sync — parity test enforces values.
export const ERROR_HANDLING = {
  CONTINUE: 'continue',
  CONTINUE_DEFAULT: 'continue_default',
  FAIL_WORKFLOW: 'fail_workflow',
  SKIP_ITEM: 'skip_item',
  RETRY_THEN_FAIL: 'retry_then_fail',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
};

export const PLATFORM_NODE_DEFAULTS = {
  dataQuery: { timeoutSeconds: 120, retryLimit: 0, retryDelaySeconds: 5 },
  javascript: { timeoutSeconds: 30, retryLimit: 0, retryDelaySeconds: 5 },
  subWorkflow: { timeoutSeconds: 300, retryLimit: 0, retryDelaySeconds: 5 },
  switch: { timeoutSeconds: 30, retryLimit: 0, retryDelaySeconds: 5 },
  fanout: { timeoutSeconds: 30, retryLimit: 0, retryDelaySeconds: 5 },
  join: { timeoutSeconds: 30, retryLimit: 0, retryDelaySeconds: 5 },
  approval: { timeoutSeconds: 60, retryLimit: 0, retryDelaySeconds: 5 },
  default: { timeoutSeconds: 60, retryLimit: 0, retryDelaySeconds: 5 },
};

export const PLATFORM_WORKFLOW_DEFAULTS = {
  workflowRunTimeout: '7 days',
  workflowTaskTimeout: '30 seconds',
  humanInLoopTimeout: '24 hours',
  defaultNodeTimeoutSeconds: 120,
  defaultRetryLimit: 0,
  defaultRetryDelaySeconds: 5,
};

const LIMITS = {
  timeoutSeconds: { min: 1, max: 3600 },
  retryLimit: { min: 0, max: 10 },
  retryDelaySeconds: { min: 0, max: 300 },
};

function isDefined(v) {
  return v !== undefined && v !== null && v !== '';
}

function toInt(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return n < 0 ? Math.ceil(n) : Math.floor(n);
}

function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export function resolveNodePolicy(nodeType, nodeData, workflowConfig) {
  const data = nodeData && typeof nodeData === 'object' ? nodeData : {};
  const wf = workflowConfig && typeof workflowConfig === 'object' ? workflowConfig : {};
  const typeDefaults = wf.nodeDefaults && wf.nodeDefaults[nodeType] ? wf.nodeDefaults[nodeType] : {};
  const platform = PLATFORM_NODE_DEFAULTS[nodeType] || PLATFORM_NODE_DEFAULTS.default;

  const timeoutSeconds = isDefined(data.timeoutSeconds)
    ? clamp(toInt(data.timeoutSeconds, platform.timeoutSeconds), LIMITS.timeoutSeconds.min, LIMITS.timeoutSeconds.max)
    : isDefined(typeDefaults.timeoutSeconds)
      ? clamp(toInt(typeDefaults.timeoutSeconds, platform.timeoutSeconds), LIMITS.timeoutSeconds.min, LIMITS.timeoutSeconds.max)
      : isDefined(wf.defaultNodeTimeoutSeconds)
        ? clamp(toInt(wf.defaultNodeTimeoutSeconds, platform.timeoutSeconds), LIMITS.timeoutSeconds.min, LIMITS.timeoutSeconds.max)
        : platform.timeoutSeconds;

  const retryLimit = isDefined(data.retryLimit)
    ? clamp(toInt(data.retryLimit, platform.retryLimit), LIMITS.retryLimit.min, LIMITS.retryLimit.max)
    : isDefined(typeDefaults.retryLimit)
      ? clamp(toInt(typeDefaults.retryLimit, platform.retryLimit), LIMITS.retryLimit.min, LIMITS.retryLimit.max)
      : isDefined(wf.defaultRetryLimit)
        ? clamp(toInt(wf.defaultRetryLimit, platform.retryLimit), LIMITS.retryLimit.min, LIMITS.retryLimit.max)
        : platform.retryLimit;

  const retryDelaySeconds = isDefined(data.retryDelaySeconds)
    ? clamp(toInt(data.retryDelaySeconds, platform.retryDelaySeconds), LIMITS.retryDelaySeconds.min, LIMITS.retryDelaySeconds.max)
    : isDefined(typeDefaults.retryDelaySeconds)
      ? clamp(toInt(typeDefaults.retryDelaySeconds, platform.retryDelaySeconds), LIMITS.retryDelaySeconds.min, LIMITS.retryDelaySeconds.max)
      : isDefined(wf.defaultRetryDelaySeconds)
        ? clamp(toInt(wf.defaultRetryDelaySeconds, platform.retryDelaySeconds), LIMITS.retryDelaySeconds.min, LIMITS.retryDelaySeconds.max)
        : platform.retryDelaySeconds;

  return { timeoutSeconds, retryLimit, retryDelaySeconds };
}

export function resolveHumanTimeout(nodeData, workflowConfig) {
  const data = nodeData && typeof nodeData === 'object' ? nodeData : {};
  const wf = workflowConfig && typeof workflowConfig === 'object' ? workflowConfig : {};
  if (isDefined(data.expiryMinutes)) return `${data.expiryMinutes} minutes`;
  if (isDefined(data.timeout)) return String(data.timeout);
  if (isDefined(wf.humanInLoopTimeout)) return String(wf.humanInLoopTimeout);
  return PLATFORM_WORKFLOW_DEFAULTS.humanInLoopTimeout;
}

export function isNonRetryableError(err) {
  if (!err) return false;
  // Primary signal: activities throw ApplicationFailure.nonRetryable for
  // deterministic user-code errors. This flag survives Temporal serialization.
  if (err.nonRetryable === true) return true;
  if (err.type === 'ApplicationFailure' && err.nonRetryable === true) return true;
  // Fallback: match deterministic failure messages. instanceof checks are
  // intentionally NOT used here — error prototypes do not survive the
  // activity → workflow serialization boundary.
  const msg = err.message || String(err);
  return /is not defined|is not a function|Unexpected token|SyntaxError/.test(msg);
}
