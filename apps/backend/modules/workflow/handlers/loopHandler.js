/**
 * Loop Node Handler
 * Resumable iterator. Each execution emits one item to the loop body and stores
 * cursor state in the workflow context. The graph should connect the last node
 * in the body back to this loop node; when all items are consumed the handler
 * follows the completed handle.
 */
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');
const Logger = require('../../../utils/logger');

const DEFAULT_MAX_ITERATIONS = 1000;
const MAX_MAX_ITERATIONS = 100000;
const MAX_DELAY_BETWEEN_ITEMS_MS = 60000;

function toPositiveInteger(value, fallback, max, fieldName) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1 || number > max) {
    throw new Error(`${fieldName} must be an integer between 1 and ${max}`);
  }
  return number;
}

function toDelayMs(value) {
  const number = Number(value ?? 0);
  if (!Number.isInteger(number) || number < 0 || number > MAX_DELAY_BETWEEN_ITEMS_MS) {
    throw new Error(`delayBetweenItems must be an integer between 0 and ${MAX_DELAY_BETWEEN_ITEMS_MS}`);
  }
  return number;
}

function normalizeItems(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

async function execute(nodeConfig, context, helpers) {
  const { resolveTemplate } = helpers;
  const nodeID = helpers?.nodeID || 'unknown';
  const { 
    sourceVariable, 
    itemVariable = 'item', 
    indexVariable = 'index',
    outputVariable = 'loopResults',
    maxIterations = DEFAULT_MAX_ITERATIONS,
    delayBetweenItems = 0,
    errorHandling = ERROR_HANDLING.CONTINUE,
    isDisabled = false,
  } = nodeConfig || {};
  
  Logger.log('info', {
    message: 'loopHandler:execute:params',
    params: { nodeID, instanceID: helpers?.instanceID, sourceVariable, maxIterations, isDisabled },
  });

  try {
    if (isDisabled) {
      return {
        output: {
          [outputVariable]: [],
          skipped: true,
          success: true,
        },
        nextHandle: NEXT_HANDLE.COMPLETED,
      };
    }

    const iterationLimit = toPositiveInteger(
      maxIterations,
      DEFAULT_MAX_ITERATIONS,
      MAX_MAX_ITERATIONS,
      'maxIterations'
    );
    const itemDelayMs = toDelayMs(delayBetweenItems);
    const stateKey = `__loop_${nodeID}`;
    const existingState = context?.[stateKey];

    let loopState = existingState && existingState.sourceVariable === sourceVariable
      ? existingState
      : null;

    if (loopState?.completed) {
      return {
        output: {
          [outputVariable]: loopState.results || [],
          totalItems: loopState.totalItems,
          success: true,
          __contextPatch: {
            [outputVariable]: loopState.results || [],
            [stateKey]: loopState,
          },
        },
        nextHandle: NEXT_HANDLE.COMPLETED,
      };
    }

    if (!loopState) {
      const resolvedItems = typeof sourceVariable === 'string'
        ? resolveTemplate(sourceVariable, { nodeType: 'loop' })
        : sourceVariable;
      const items = normalizeItems(resolvedItems);

      if (items.length > iterationLimit) {
        throw new Error(`Loop source has ${items.length} items, exceeding maxIterations ${iterationLimit}`);
      }

      loopState = {
        sourceVariable,
        items,
        nextIndex: 0,
        totalItems: items.length,
        results: [],
        completed: false,
      };
    }

    if (loopState.nextIndex >= loopState.totalItems) {
      const completedState = { ...loopState, completed: true };
      return {
        output: {
          [outputVariable]: completedState.results || [],
          totalItems: completedState.totalItems,
          success: true,
          __contextPatch: {
            [outputVariable]: completedState.results || [],
            [stateKey]: completedState,
          },
        },
        nextHandle: NEXT_HANDLE.COMPLETED,
      };
    }

    const currentIndex = loopState.nextIndex;
    const currentItem = loopState.items[currentIndex];
    const nextState = {
      ...loopState,
      nextIndex: currentIndex + 1,
      completed: currentIndex + 1 >= loopState.totalItems,
    };
    
    const output = {
      currentItem,
      currentIndex,
      totalItems: loopState.totalItems,
      remainingItems: loopState.totalItems - currentIndex - 1,
      success: true,
      __contextPatch: {
        [itemVariable]: currentItem,
        [indexVariable]: currentIndex,
        [stateKey]: nextState,
        __loopCurrent: {
          nodeID,
          itemVariable,
          indexVariable,
          item: currentItem,
          index: currentIndex,
          totalItems: loopState.totalItems,
        },
      },
      loopConfig: {
        itemVariable,
        indexVariable,
        currentIndex,
        totalItems: loopState.totalItems,
      },
    };
    
    return {
      output,
      nextHandle: NEXT_HANDLE.LOOP,
      queueDelay: currentIndex > 0 ? itemDelayMs : 0,
    };
  } catch (error) {
    Logger.log('error', {
      message: 'loopHandler:execute:error',
      params: { nodeID, instanceID: helpers?.instanceID, error: error.message },
    });
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
