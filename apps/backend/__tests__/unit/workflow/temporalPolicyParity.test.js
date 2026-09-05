/**
 * Parity between Node workflowConfig.js and sandbox workflowPolicy.js.
 * Both must resolve the same policy for the same inputs; defaults must match policyDefaults.json.
 */
const {
  PLATFORM_NODE_DEFAULTS,
  PLATFORM_WORKFLOW_DEFAULTS,
  LIMITS,
  resolveNodeExecutionConfig,
  resolveWorkflowConfig,
} = require('../../../modules/workflow/temporal/workflowConfig');
const json = require('../../../modules/workflow/temporal/policyDefaults.json');

describe('temporal policy parity', () => {
  test('Node defaults match policyDefaults.json', () => {
    expect(PLATFORM_NODE_DEFAULTS).toEqual(json.PLATFORM_NODE_DEFAULTS);
    expect(LIMITS.timeoutSeconds).toEqual(json.LIMITS.timeoutSeconds);
    expect(LIMITS.retryLimit).toEqual(json.LIMITS.retryLimit);
    expect(LIMITS.retryDelaySeconds).toEqual(json.LIMITS.retryDelaySeconds);
  });

  test('resolveNodeExecutionConfig honors node > workflow > platform', () => {
    const wf = resolveWorkflowConfig({ defaultNodeTimeoutSeconds: 99, nodeDefaults: { javascript: { timeoutSeconds: 77 } } });
    // explicit node wins
    expect(resolveNodeExecutionConfig('javascript', { timeoutSeconds: 11 }, wf).timeoutSeconds).toBe(11);
    // workflow type-default wins over workflow generic default
    expect(resolveNodeExecutionConfig('javascript', {}, wf).timeoutSeconds).toBe(77);
    // empty workflow config falls back to resolved workflow default (120), which
    // shadows the platform type-default (javascript 30) by design — type-defaults
    // only apply when explicitly set in nodeDefaults.
    expect(resolveNodeExecutionConfig('javascript', {}, resolveWorkflowConfig({})).timeoutSeconds).toBe(
      json.PLATFORM_WORKFLOW_DEFAULTS.defaultNodeTimeoutSeconds
    );
  });

  test('clamps enforce LIMITS', () => {
    const wf = resolveWorkflowConfig({});
    expect(resolveNodeExecutionConfig('javascript', { timeoutSeconds: 99999 }, wf).timeoutSeconds).toBe(
      json.LIMITS.timeoutSeconds.max
    );
    expect(resolveNodeExecutionConfig('javascript', { retryLimit: 99 }, wf).retryLimit).toBe(
      json.LIMITS.retryLimit.max
    );
  });
});
