/**
 * Workflow Node Constants
 * Centralized constants for workflow nodes frontend package
 */

// Error handling strategies (must match backend handlers/constants.js)
export const ERROR_HANDLING = {
  CONTINUE: 'continue',           // Continue workflow via error handle
  FAIL_WORKFLOW: 'fail_workflow', // Stop entire workflow on error
};

// Error handling options for JSON Forms select
export const ERROR_HANDLING_OPTIONS = [
  { value: ERROR_HANDLING.FAIL_WORKFLOW, label: 'Fail Workflow' },
  { value: ERROR_HANDLING.CONTINUE, label: 'Continue on Error Path' },
];

// Node handle types (output ports)
export const HANDLE_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  DEFAULT: 'default',
  TRUE: 'true',
  FALSE: 'false',
  LOOP: 'loop',
  DONE: 'done',
  OUTPUT: 'output',
};

// Node execution status (for visual indicators)
export const NODE_EXECUTION_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};
