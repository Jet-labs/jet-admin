/**
 * Start Node Handler
 * Initializes workflow context with input parameters
 */
async function execute(nodeConfig, context, helpers) {
  const { inputParameters = [] } = nodeConfig || {};
  
  // Input is already set in context by orchestrator
  // Just pass through - start node mainly validates inputs
  
  const output = {
    started: true,
    inputReceived: context.input || {},
  };
  
  return {
    output,
    nextHandle: 'output',
  };
}

module.exports = { execute };
