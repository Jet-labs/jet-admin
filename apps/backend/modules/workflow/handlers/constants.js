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

module.exports = {
  ERROR_HANDLING,
  NEXT_HANDLE,
  EXECUTION_STATUS,
};
