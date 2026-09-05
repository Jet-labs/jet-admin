/**
 * Workflow Logic Constants — single source of truth for node execution
 * Mirrors backend handlers/constants.js and frontend workflow-nodes/constants.js
 */

export const ERROR_HANDLING = {
  CONTINUE: 'continue',
  CONTINUE_DEFAULT: 'continue_default',
  FAIL_WORKFLOW: 'fail_workflow',
  SKIP_ITEM: 'skip_item',
  RETRY_THEN_FAIL: 'retry_then_fail',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
};

// Allowlist for validator + UI (frontend loopNode + workflowPolicy must match).
export const ERROR_HANDLING_VALUES = Object.values(ERROR_HANDLING);

export const NEXT_HANDLE = {
  SUCCESS: 'success',
  ERROR: 'error',
  DEFAULT: 'default',
  TRUE: 'true',
  FALSE: 'false',
  LOOP: 'loop',
  DONE: 'done',
  COMPLETED: 'completed',
  OUTPUT: 'output',
};

export const NODE_TYPE = {
  START: 'start',
  DATA_QUERY: 'dataQuery',
  JAVASCRIPT: 'javascript',
  CONDITION: 'condition',
  SWITCH: 'switch',
  LOOP: 'loop',
  DELAY: 'delay',
  END: 'end',
  DATA_COLLECTION: 'dataCollection',
  APPROVAL: 'approval',
  FANOUT: 'fanout',
  JOIN: 'join',
  SUB_WORKFLOW: 'subWorkflow',
};

export function serializeError(err) {
  if (!err) return { message: 'Unknown error' };
  if (typeof err === 'string') return { message: err };
  const serialized = {
    message: err.message || String(err),
    name: err.name || 'Error',
    stack: err.stack || null,
  };
  const SKIP_KEYS = new Set(['stack', 'response', 'request', 'config', 'errors']);
  for (const key of Object.getOwnPropertyNames(err)) {
    if (SKIP_KEYS.has(key)) continue;
    const val = err[key];
    if (typeof val === 'function') continue;
    if (val === null || val === undefined || typeof val !== 'object') {
      serialized[key] = val;
    } else {
      try {
        JSON.stringify(val);
        serialized[key] = val;
      } catch {
        serialized[key] = String(val);
      }
    }
  }
  if (err.response) {
    serialized.response = {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    };
  }
  if (err.request) {
    serialized.request = {
      url: err.config?.url || err.request._currentUrl || err.request.url,
      method: err.config?.method || err.request.method,
    };
  }
  if (err.errors) serialized.errors = err.errors;
  return serialized;
}
