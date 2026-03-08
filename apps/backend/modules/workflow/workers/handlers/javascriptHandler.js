/**
 * JavaScript Node Handler
 * Executes user-provided JavaScript code in a sandbox
 */
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');
const { createWorkflowVm } = require('./workflowVm');

async function execute(nodeConfig, context, helpers) {
  const { 
    code, 
    outputVariable = 'jsResult', 
    timeoutSeconds = 30,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  if (!code) {
    throw new Error('JavaScript node requires code');
  }
  
  try {
    // Create sandbox with context
    const sandbox = {
      ctx: context,
      console: {
        log: (...args) => {}, // Suppress console in sandbox
      },
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };
    
    // Create VM with timeout
    const vm = createWorkflowVm({
      timeoutMs: timeoutSeconds * 1000,
      sandbox,
    });
    
    // Wrap code to return last expression
    const wrappedCode = `
      (function() {
        ${code}
      })()
    `;
    
    // Execute
    let result = vm.run(wrappedCode);
    
    // Handle Promise results (if user returned a Promise)
    if (result && typeof result.then === 'function') {
      result = await Promise.race([
        result,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Async operation timed out')), timeoutSeconds * 1000)
        )
      ]);
    }
    
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
        error: error.message,
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
