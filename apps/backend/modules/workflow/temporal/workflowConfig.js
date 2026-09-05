/**
 * Workflow Config Resolver — per-workflow execution policy.
 *
 * Precedence (highest wins):
 *   1. Node-level   — node.data.timeoutSeconds / retryLimit / retryDelaySeconds
 *   2. Workflow-level — tblWorkflows.workflowOptions.{defaultNodeTimeoutSeconds,
 *      defaultRetryLimit, defaultRetryDelaySeconds, nodeDefaults.<type>.*, ...}
 *   3. Platform-level — ACTIVITY_OPTIONS / WORKFLOW_OPTIONS in ./config
 *      (plus numeric mirrors below). Used ONLY when 1 and 2 are undefined.
 *
 * service.js materializes resolved values into the node payload before starting
 * the Temporal workflow, and uses resolved workflowRunTimeout/workflowTaskTimeout
 * for client.workflow.start(). dslWorkflow.js re-resolves defensively via its
 * deterministic mirror (workflows/workflowPolicy.js — keep in sync).
 */

const { WORKFLOW_OPTIONS } = require('./config');
// Single source of truth for defaults/limits — see ./policyDefaults.json.
// workflowPolicy.js (sandbox ESM) mirrors these values; parity is enforced by
// apps/backend/__tests__/unit/workflow/temporalPolicyParity.test.js.
// NOTE: retryLimit = number of RETRIES after the first attempt.
// Temporal maximumAttempts = retryLimit + 1. retryLimit 0 == single attempt.
const {
  PLATFORM_NODE_DEFAULTS: JSON_NODE_DEFAULTS,
  PLATFORM_WORKFLOW_DEFAULTS: JSON_WF_DEFAULTS,
  LIMITS: JSON_LIMITS,
} = require('./policyDefaults.json');

const PLATFORM_NODE_DEFAULTS = JSON_NODE_DEFAULTS;

const PLATFORM_WORKFLOW_DEFAULTS = {
  workflowRunTimeout: WORKFLOW_OPTIONS.workflowRunTimeout || JSON_WF_DEFAULTS.workflowRunTimeout,
  workflowTaskTimeout: WORKFLOW_OPTIONS.workflowTaskTimeout || JSON_WF_DEFAULTS.workflowTaskTimeout,
  humanInLoopTimeout: WORKFLOW_OPTIONS.humanInLoopTimeout || JSON_WF_DEFAULTS.humanInLoopTimeout,
  defaultNodeTimeoutSeconds: JSON_WF_DEFAULTS.defaultNodeTimeoutSeconds,
  defaultRetryLimit: JSON_WF_DEFAULTS.defaultRetryLimit,
  defaultRetryDelaySeconds: JSON_WF_DEFAULTS.defaultRetryDelaySeconds,
};

const LIMITS = {
  timeoutSeconds: JSON_LIMITS.timeoutSeconds,
  retryLimit: JSON_LIMITS.retryLimit,
  retryDelaySeconds: JSON_LIMITS.retryDelaySeconds,
};

function isDefined(v) {
  return v !== undefined && v !== null && v !== '';
}

function toInt(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Normalize raw workflowOptions JSON into a fully-resolved workflow config.
 * Never throws on unknown shapes — unknown keys pass through untouched.
 *
 * Supported keys (all optional):
 *   workflowRunTimeout, workflowTaskTimeout, humanInLoopTimeout
 *     (Temporal duration string e.g. '7 days' or seconds number)
 *   defaultNodeTimeoutSeconds, defaultRetryLimit, defaultRetryDelaySeconds
 *   nodeDefaults: { <nodeType>: { timeoutSeconds, retryLimit, retryDelaySeconds } }
 */
function resolveWorkflowConfig(workflowOptions) {
  const opts = workflowOptions && typeof workflowOptions === 'object' ? workflowOptions : {};
  const nodeDefaults = opts.nodeDefaults && typeof opts.nodeDefaults === 'object' ? opts.nodeDefaults : {};

  return {
    workflowRunTimeout: isDefined(opts.workflowRunTimeout)
      ? opts.workflowRunTimeout
      : PLATFORM_WORKFLOW_DEFAULTS.workflowRunTimeout,
    workflowTaskTimeout: isDefined(opts.workflowTaskTimeout)
      ? opts.workflowTaskTimeout
      : PLATFORM_WORKFLOW_DEFAULTS.workflowTaskTimeout,
    humanInLoopTimeout: isDefined(opts.humanInLoopTimeout)
      ? opts.humanInLoopTimeout
      : PLATFORM_WORKFLOW_DEFAULTS.humanInLoopTimeout,
    defaultNodeTimeoutSeconds: clamp(
      toInt(opts.defaultNodeTimeoutSeconds, PLATFORM_WORKFLOW_DEFAULTS.defaultNodeTimeoutSeconds),
      LIMITS.timeoutSeconds.min,
      LIMITS.timeoutSeconds.max
    ),
    defaultRetryLimit: clamp(
      toInt(opts.defaultRetryLimit, PLATFORM_WORKFLOW_DEFAULTS.defaultRetryLimit),
      LIMITS.retryLimit.min,
      LIMITS.retryLimit.max
    ),
    defaultRetryDelaySeconds: clamp(
      toInt(opts.defaultRetryDelaySeconds, PLATFORM_WORKFLOW_DEFAULTS.defaultRetryDelaySeconds),
      LIMITS.retryDelaySeconds.min,
      LIMITS.retryDelaySeconds.max
    ),
    nodeDefaults,
  };
}

/**
 * Resolve effective per-node execution policy.
 * Order: node.data > workflowOptions.nodeDefaults[type] > workflowOptions.defaults > platform.
 */
function resolveNodeExecutionConfig(nodeType, nodeData, workflowConfig) {
  const data = nodeData && typeof nodeData === 'object' ? nodeData : {};
  const wf = workflowConfig || {};
  const typeDefaults =
    (wf.nodeDefaults && wf.nodeDefaults[nodeType]) || {};
  const platform =
    PLATFORM_NODE_DEFAULTS[nodeType] || PLATFORM_NODE_DEFAULTS.default;

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

/**
 * Materialize resolved values into a node list copy.
 * Explicit node.data values are preserved; only undefined fields are filled.
 * Returns a NEW array (does not mutate inputs).
 */
function applyWorkflowConfigToNodes(nodes, workflowConfig) {
  const list = Array.isArray(nodes) ? nodes : [];
  return list.map((node) => {
    const resolved = resolveNodeExecutionConfig(node?.type, node?.data, workflowConfig);
    return {
      ...node,
      data: {
        ...(node?.data || {}),
        timeoutSeconds: isDefined(node?.data?.timeoutSeconds) ? node.data.timeoutSeconds : resolved.timeoutSeconds,
        retryLimit: isDefined(node?.data?.retryLimit) ? node.data.retryLimit : resolved.retryLimit,
        retryDelaySeconds: isDefined(node?.data?.retryDelaySeconds)
          ? node.data.retryDelaySeconds
          : resolved.retryDelaySeconds,
      },
    };
  });
}

/**
 * Temporal duration helper — accepts a duration string ('7 days') or a
 * seconds number. Returns the string form Temporal client expects.
 */
function toTemporalDuration(value, fallback) {
  if (!isDefined(value)) return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return `${Math.max(1, Math.trunc(value))} seconds`;
  return String(value);
}

/**
 * Start options for client.workflow.start derived from resolved config.
 */
function resolveWorkflowStartOptions(workflowConfig) {
  const wf = workflowConfig || {};
  return {
    workflowRunTimeout: toTemporalDuration(wf.workflowRunTimeout, PLATFORM_WORKFLOW_DEFAULTS.workflowRunTimeout),
    workflowTaskTimeout: toTemporalDuration(wf.workflowTaskTimeout, PLATFORM_WORKFLOW_DEFAULTS.workflowTaskTimeout),
  };
}

module.exports = {
  PLATFORM_NODE_DEFAULTS,
  PLATFORM_WORKFLOW_DEFAULTS,
  LIMITS,
  isDefined,
  resolveWorkflowConfig,
  resolveNodeExecutionConfig,
  applyWorkflowConfigToNodes,
  toTemporalDuration,
  resolveWorkflowStartOptions,
};
