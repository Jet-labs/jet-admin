/**
 * Data Query Node Handler
 * Executes database queries using the QueryEngine.
 *
 * When running inside a workflow, the query is executed as a delegated call
 * with the workflow as the originating resource. This allows users who have
 * workflow:execute permission to run queries referenced by the workflow,
 * even if they lack direct dataquery:execute permission.
 */
const { authorizedExecuteDataQuery } = require("../../../utils/authorizedProxy");
const { resolveInputs } = require("../../../utils/input.util");
const { ERROR_HANDLING, NEXT_HANDLE, serializeError } = require('./constants');
const { deriveChildContext, createSystemContext, ORIGIN_TYPES } = require('../../../utils/executionContext');

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
  
  // Build execution context: this query is being run as part of a workflow
  const workflowID = helpers?.workflowID;
  const instanceID = helpers?.instanceID;
  const tenantID = helpers?.tenantID;
  let executionCtx;

  if (context?.__executionCtx) {
    // If the workflow engine already attached an execution context, derive from it
    executionCtx = deriveChildContext(context.__executionCtx, ORIGIN_TYPES.WORKFLOW, workflowID);
  } else if (workflowID || tenantID) {
    // Create a system context for the workflow (workflowID may be null for test runs)
    executionCtx = createSystemContext(ORIGIN_TYPES.WORKFLOW, workflowID || instanceID, tenantID);
  }

  try {
    // Execute query using the authorized proxy
    const result = await authorizedExecuteDataQuery({
      dataQueryID,
      executionInputs: resolved,
      executionCtx,
    });
    
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

