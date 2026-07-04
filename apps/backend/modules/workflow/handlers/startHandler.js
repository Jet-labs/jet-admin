
const { NEXT_HANDLE } = require('./constants');
const Logger = require('../../../utils/logger');
/**
 * Start Node Handler
 * Entry point for workflow execution.
 * Note: Input parameters are managed at workflow level (workflowOptions.inputDefinitions),
 * not in the Start Node config.
 */
async function execute(nodeConfig, context, helpers) {
  // Input is already set in context by orchestrator from workflowOptions.inputDefinitions
  // The start node simply marks the workflow as started and passes through
  const nodeID = helpers?.nodeID || 'start';
  const instanceID = helpers?.instanceID;

  Logger.log('info', {
    message: 'startHandler:execute:params',
    params: { nodeID, instanceID, hasInput: !!context.input },
  });

  const output = {
    started: true,
    inputReceived: context.input || {},
  };

  Logger.log('info', {
    message: 'startHandler:execute:success',
    params: { nodeID, instanceID },
  });

  return {
    output,
    nextHandle: NEXT_HANDLE.OUTPUT,
  };
}

module.exports = { execute };
