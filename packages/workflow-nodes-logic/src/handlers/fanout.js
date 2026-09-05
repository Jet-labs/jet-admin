import { ERROR_HANDLING, serializeError } from '../constants.js';

/**
 * Fan-out handler — fires ALL named branches.
 * Returns a `__fanout` marker; the orchestrator (dslWorkflow) enqueues the
 * outgoing edges of every listed handle. Branches execute sequentially in
 * sorted order (same determinism guarantee as the engine's wave executor —
 * fan-out is path parallelism, not thread parallelism).
 *
 * Config:
 *  - branches: [{ id, name }] — every branch is always taken
 *  - errorHandling
 */
export async function executeFanout(nodeConfig, context, helpers = {}) {
  const {
    branches = [],
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};
  try {
    const handles = (branches || []).map((b) => b && b.id).filter(Boolean);
    if (handles.length === 0) {
      throw new Error('Fan-out node requires at least one branch.');
    }
    return {
      output: { branches: handles, success: true },
      nextHandle: handles[0],
      __fanout: true,
      handles,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { branches: [], success: false, error: serializeError(err) },
      nextHandle: 'error',
    };
  }
}
