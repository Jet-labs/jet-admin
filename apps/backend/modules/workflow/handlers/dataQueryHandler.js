/**
 * Data Query Node Handler
 * Executes database queries using the QueryEngine
 */
const { createQueryEngine } = require("../../dataQuery/dataQuery.service");
const { resolveInputs } = require("../../../utils/input.util");
const { ERROR_HANDLING, NEXT_HANDLE, serializeError } = require('./constants');

async function execute(nodeConfig, context, helpers) {
  const { 
    dataQueryID, 
    inputValues = {}, 
    outputVariable = 'queryResult',
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  if (!dataQueryID) {
    throw new Error('Data Query node requires dataQueryID');
  }
  
  // Delegate input resolution and validation to the unified pipeline
  // Pass { ctx: context } so resolveInputs can evaluate {{ctx.something}}
  const { resolved, errors, valid } = await resolveInputs({
    type: 'query',
    id: dataQueryID,
    inputValues,
    contextData: { ctx: context },
  });

  if (!valid) {
    throw new Error(`Data query input validation failed: ${JSON.stringify(errors)}`);
  }
  
  try {
    // Execute query using QueryEngine
    const engine = createQueryEngine();
    const result = await engine.executeQuery(dataQueryID, resolved);
    
    return {
      output: {
        [outputVariable]: result,
        success: true,
      },
      nextHandle: NEXT_HANDLE.SUCCESS,
    };
  } catch (error) {
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        [outputVariable]: null,
        success: false,
        error: serializeError(error),
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
