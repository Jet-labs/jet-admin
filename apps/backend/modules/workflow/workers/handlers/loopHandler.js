/**
 * Loop Node Handler
 * Iterates over arrays - Note: Loop body execution is handled by orchestrator
 */
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');

async function execute(nodeConfig, context, helpers) {
  const { resolveStringWithContext } = helpers;
  const { 
    sourceVariable, 
    itemVariable = 'item', 
    indexVariable = 'index',
    outputVariable = 'loopResults',
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  try {
    // Resolve source array using mustache syntax {{ctx.variablePath}}
    // e.g., "{{ctx.input.items}}" or "{{ctx.previousNode.data}}"
    let items;
    if (typeof sourceVariable === 'string') {
      items = resolveStringWithContext(sourceVariable);
    } else {
      items = sourceVariable;
    }
    
    // Ensure items is always an array
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    
    // Note: For now, we return the loop config
    // The orchestrator will need to handle loop iteration
    // by queueing the loop body nodes for each item
    
    const output = {
      [outputVariable]: [],
      loopConfig: {
        items,
        itemVariable,
        indexVariable,
        currentIndex: 0,
        totalItems: items.length,
      },
      success: true,
    };
    
    // If empty array, go to completed
    if (items.length === 0) {
      return {
        output,
        nextHandle: NEXT_HANDLE.DONE,
      };
    }
    
    // Start loop - go to loop body
    return {
      output,
      nextHandle: NEXT_HANDLE.LOOP,
    };
  } catch (error) {
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        [outputVariable]: [],
        success: false,
        error: error.message,
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
