
const { NEXT_HANDLE } = require('./constants');
/**
 * Start Node Handler
 * Entry point for workflow execution.
 * Note: Input parameters are managed at workflow level (workflowOptions.inputDefinitions),
 * not in the Start Node config.
 */
async function execute(nodeConfig, context, helpers) {
  // Input is already set in context by orchestrator from workflowOptions.inputDefinitions
  // The start node simply marks the workflow as started and passes through
  
  const output = {
    started: true,
    inputReceived: context.input || {},
  };
  
  return {
    output,
    nextHandle: NEXT_HANDLE.OUTPUT,
  };
}

module.exports = { execute };
