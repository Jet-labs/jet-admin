/**
 * Condition Node Handler
 * Evaluates conditions and returns the appropriate branch handle
 */
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');
const { createWorkflowVm } = require('./workflowVm');

async function execute(nodeConfig, context, helpers) {
  const { 
    branches = [], 
    defaultBranch = NEXT_HANDLE.DEFAULT,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  try {
    // Evaluate each condition in order
    for (const branch of branches) {
      const { id, condition } = branch;
      
      if (!condition) continue;
      
      // Create sandbox for condition evaluation
      const sandbox = { ctx: context };
      const vm = createWorkflowVm({ timeoutMs: 5000, sandbox });
      
      try {
        // Wrap condition in boolean check
        const result = vm.run(`Boolean(${condition})`);
        
        if (result === true) {
          return {
            output: { matched: id, condition, success: true },
            nextHandle: id,
          };
        }
      } catch (conditionError) {
        // Individual condition evaluation failed, try next
        continue;
      }
    }
    
    // No conditions matched, use default
    return {
      output: { matched: defaultBranch, condition: 'default', success: true },
      nextHandle: defaultBranch,
    };
  } catch (error) {
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        matched: null,
        success: false,
        error: error.message,
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
