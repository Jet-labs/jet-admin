/**
 * Standalone pending jobs queue to break circular dependencies
 * between workflowExecutor and the queue mock in stress tests.
 */
module.exports = [];
