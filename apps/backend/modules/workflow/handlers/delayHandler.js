/**
 * Delay Node Handler
 * Computes a bounded queue delay. The orchestrator owns the non-blocking
 * scheduling; this handler only validates and describes the wait.
 */
const { ERROR_HANDLING, NEXT_HANDLE, serializeError } = require('./constants');
const Logger = require('../../../utils/logger');

const MAX_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours: compatible with setTimeout and UI limits

function toFiniteNumber(value, fieldName) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  return number;
}

function normalizeDelayMs(value) {
  const delay = Math.trunc(toFiniteNumber(value, 'delay'));
  if (delay < 0) {
    throw new Error('delay must be greater than or equal to 0');
  }
  if (delay > MAX_DELAY_MS) {
    throw new Error(`delay must be less than or equal to ${MAX_DELAY_MS}ms`);
  }
  return delay;
}

async function execute(nodeConfig, context, helpers) {
  const { resolveTemplate } = helpers;
  const nodeID = helpers?.nodeID || 'delay';
  const instanceID = helpers?.instanceID;
  const { 
    delayType = 'fixed', 
    delayMinutes = 0, 
    delaySeconds = 0, 
    delayMs = 0,
    delayVariable,
    untilTime,
    errorHandling = ERROR_HANDLING.CONTINUE,
    isDisabled = false,
  } = nodeConfig || {};

  Logger.log('info', {
    message: 'delayHandler:execute:params',
    params: { nodeID, instanceID, delayType, isDisabled },
  });

  try {
    if (isDisabled) {
      return {
        output: {
          delayedMs: 0,
          delayType,
          skipped: true,
          success: true,
        },
        nextHandle: NEXT_HANDLE.OUTPUT,
        queueDelay: 0,
      };
    }

    let totalDelayMs = 0;
    
    if (delayType === 'fixed') {
      const minutes = toFiniteNumber(delayMinutes, 'delayMinutes');
      const seconds = toFiniteNumber(delaySeconds, 'delaySeconds');
      const milliseconds = toFiniteNumber(delayMs, 'delayMs');
      totalDelayMs = (minutes * 60000) + (seconds * 1000) + milliseconds;
    } else if (delayType === 'dynamic' && delayVariable) {
      const dynamicDelay = resolveTemplate(delayVariable, { nodeType: 'delay' });
      totalDelayMs = dynamicDelay;
    } else if (delayType === 'until' && untilTime) {
      const resolvedUntilTime = resolveTemplate(untilTime, { nodeType: 'delay' });
      const targetTime = new Date(resolvedUntilTime).getTime();
      if (!Number.isFinite(targetTime)) {
        throw new Error('untilTime must resolve to a valid date/time');
      }
      totalDelayMs = Math.max(0, targetTime - Date.now());
    } else {
      throw new Error(`Unsupported or incomplete delayType: ${delayType}`);
    }

    totalDelayMs = normalizeDelayMs(totalDelayMs);
    
    const output = {
      delayedMs: totalDelayMs,
      delayType,
      success: true,
    };
    
    // KEY: Return queueDelay - next node will be queued with this delay
    // This is NON-BLOCKING - no thread waiting!
    // NOTE: nextHandle must be 'output' to match the delay node's
    //       React Flow Handle id="output" (sourceHandle on edges).
    return {
      output,
      nextHandle: NEXT_HANDLE.OUTPUT,
      queueDelay: totalDelayMs,
    };
  } catch (error) {
    Logger.log('error', {
      message: 'delayHandler:execute:error',
      params: { nodeID: helpers?.nodeID, instanceID: helpers?.instanceID, error: error.message },
    });
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        delayedMs: 0,
        success: false,
        error: serializeError(error),
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
