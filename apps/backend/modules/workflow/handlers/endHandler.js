const Logger = require("../../../utils/logger");

/**
 * End Node Handler
 * Collects outputs and marks workflow as terminal
 */
async function execute(nodeConfig, context, helpers) {
  const { resolveTemplate } = helpers;
  const { 
    status = 'success', 
    outputParameters = [] 
  } = nodeConfig || {};
  
  // Collect outputs from context based on output parameters
  const workflowOutput = {};
  
  for (const param of outputParameters) {
    const { name, sourceVariable } = param;
    if (name && sourceVariable) {
      const value = resolveTemplate(sourceVariable, { nodeType: 'end' });
      Logger.log('info', {
        message: 'endHandler:collectingOutput',
        params: { instanceID: helpers.instanceID, name, sourceVariable },
      });
      workflowOutput[name] = value;
    }
  }

  Logger.log('info', {
    message: 'endHandler:executed',
    params: { instanceID: helpers.instanceID, outputParameters },
  });

  const output = {
    status,
    workflowOutput,
    completedAt: new Date().toISOString(),
  };
  
  // This is a terminal node - no nextHandle needed
  return {
    output,
    nextHandle: null, // Terminal
  };
}

module.exports = { execute };
