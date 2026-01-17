/**
 * Delay Node Handler
 * Returns delay for non-blocking queue-based wait
 */
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');

async function execute(nodeConfig, context, helpers) {
  const { resolveStringWithContext } = helpers;
  const { 
    delayType = 'fixed', 
    delayMinutes = 0, 
    delaySeconds = 0, 
    delayMs = 0,
    delayVariable,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  try {
    let totalDelayMs = 0;
    
    if (delayType === 'fixed') {
      totalDelayMs = (delayMinutes * 60000) + (delaySeconds * 1000) + delayMs;
    } else if (delayType === 'dynamic' && delayVariable) {
      const dynamicDelay = resolveStringWithContext(delayVariable);
      totalDelayMs = parseInt(dynamicDelay) || 0;
    }
    
    const output = {
      delayedMs: totalDelayMs,
      delayType,
      success: true,
    };
    
    // KEY: Return queueDelay - next node will be queued with this delay
    // This is NON-BLOCKING - no thread waiting!
    return {
      output,
      nextHandle: NEXT_HANDLE.SUCCESS,
      queueDelay: totalDelayMs,
    };
  } catch (error) {
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        delayedMs: 0,
        success: false,
        error: error.message,
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
