import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

/**
 * Join handler — barrier merge.
 * The orchestrator already waits for upstream nodes (joinMode all/any) before
 * dispatching this node; the handler merges the listed source variables into
 * a single `outputVariable` object for downstream consumers.
 *
 * Config:
 *  - sourceVariables: string[] — ctx keys to collect (e.g. ['branchAResult'])
 *  - outputVariable (default 'joined')
 *  - joinMode: 'all' | 'any' (barrier behaviour, honored by the orchestrator)
 *  - requireAll (default true): missing variable throws (or routes to error
 *    per errorHandling) instead of resolving to null
 *  - errorHandling
 */
export async function executeJoin(nodeConfig, context, helpers = {}) {
  const {
    sourceVariables = [],
    outputVariable = 'joined',
    requireAll = true,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};
  try {
    const merged = {};
    const missing = [];
    for (const key of sourceVariables || []) {
      if (!key) continue;
      const value = context ? context[key] : undefined;
      if (value === undefined) {
        missing.push(key);
        merged[key] = null;
      } else {
        merged[key] = value;
      }
    }
    if (requireAll && missing.length > 0) {
      throw new Error(`Join is missing upstream output(s): ${missing.join(', ')}`);
    }
    return {
      output: { [outputVariable]: merged, success: true },
      nextHandle: NEXT_HANDLE.OUTPUT,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { [outputVariable]: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
