/**
 * Workflow Handler Constants
 * Standardized options and enums for node handlers
 */

// Error handling strategies
const ERROR_HANDLING = {
  CONTINUE: 'continue',       // Continue workflow via error handle
  FAIL_WORKFLOW: 'fail_workflow', // Stop entire workflow on error
  SKIP_ITEM: 'skip_item',
};

// Standard next handles
const NEXT_HANDLE = {
  SUCCESS: 'success',
  ERROR: 'error',
  DEFAULT: 'default',
  // For condition nodes
  TRUE: 'true',
  FALSE: 'false',
  // For loop nodes
  LOOP: 'loop',
  DONE: 'done',
  COMPLETED: 'completed',
  // For delay & start nodes
  OUTPUT: 'output',
};

// Node execution status (for logging)
const EXECUTION_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  SKIPPED: 'skipped',
};

function serializeError(err) {
  if (!err) return { message: 'Unknown error' };
  
  if (typeof err === 'string') {
    return { message: err };
  }

  // Create a base object with standard fields
  const serialized = {
    message: err.message || String(err),
    name: err.name || 'Error',
    stack: err.stack || null,
  };

  // Keys handled explicitly below or known to carry circular references
  // (Axios errors: response → request → socket → … → request)
  const SKIP_KEYS = new Set([
    'stack', 'response', 'request', 'config', 'errors',
  ]);

  // Capture safe enumerable properties (primitives / plain objects only)
  for (const key of Object.getOwnPropertyNames(err)) {
    if (SKIP_KEYS.has(key)) continue;
    const val = err[key];
    if (typeof val === 'function') continue;
    // Only copy JSON-safe primitives and shallow objects
    if (val === null || val === undefined || typeof val !== 'object') {
      serialized[key] = val;
    } else {
      // Attempt a safe stringify to detect circular references
      try {
        JSON.stringify(val);
        serialized[key] = val;
      } catch {
        serialized[key] = String(val);
      }
    }
  }

  // Handle Axios/REST API errors explicitly if response/request are present
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

  // Handle GraphQL specific errors
  if (err.errors) {
    serialized.errors = err.errors;
  }

  return serialized;
}

module.exports = {
  ERROR_HANDLING,
  NEXT_HANDLE,
  EXECUTION_STATUS,
  serializeError,
};
