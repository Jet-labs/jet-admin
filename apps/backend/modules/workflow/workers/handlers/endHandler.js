/**
 * End Node Handler
 * Collects outputs and marks workflow as terminal
 */
async function execute(nodeConfig, context, helpers) {
  const { resolveFromContext } = helpers;
  const { 
    status = 'success', 
    outputParameters = [] 
  } = nodeConfig || {};
  
  // Collect outputs from context based on output parameters
  const workflowOutput = {};
  
  for (const param of outputParameters) {
    const { name, sourceVariable } = param;
    if (name && sourceVariable) {
      workflowOutput[name] = resolveFromContext(sourceVariable);
    }
  }
  
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
