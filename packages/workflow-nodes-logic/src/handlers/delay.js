import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

const MAX_DELAY_MS = 24 * 60 * 60 * 1000;
function toFiniteNumber(value, fieldName) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) throw new Error(`${fieldName} must be a finite number`);
  return number;
}
function normalizeDelayMs(value) {
  const delay = Math.trunc(toFiniteNumber(value, 'delay'));
  if (delay < 0) throw new Error('delay must be greater than or equal to 0');
  if (delay > MAX_DELAY_MS) throw new Error(`delay must be less than or equal to ${MAX_DELAY_MS}ms`);
  return delay;
}

export async function executeDelay(nodeConfig, context, helpers = {}) {
  const { resolveTemplate } = helpers;
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
  try {
    if (isDisabled) {
      return {
        output: { delayedMs: 0, delayType, skipped: true, success: true },
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
      const dynamicDelay = resolveTemplate ? resolveTemplate(delayVariable, { nodeType: 'delay' }) : delayVariable;
      totalDelayMs = Number(dynamicDelay) || 0;
    } else if (delayType === 'until' && untilTime) {
      const resolvedUntilTime = resolveTemplate ? resolveTemplate(untilTime, { nodeType: 'delay' }) : untilTime;
      const targetTime = new Date(resolvedUntilTime).getTime();
      if (!Number.isFinite(targetTime)) throw new Error('untilTime must resolve to a valid date/time');
      totalDelayMs = Math.max(0, targetTime - Date.now());
    } else {
      throw new Error(`Unsupported or incomplete delayType: ${delayType}`);
    }
    totalDelayMs = normalizeDelayMs(totalDelayMs);
    const output = { delayedMs: totalDelayMs, delayType, success: true };
    return { output, nextHandle: NEXT_HANDLE.OUTPUT, queueDelay: totalDelayMs };
  } catch (error) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw error;
    return {
      output: { delayedMs: 0, success: false, error: serializeError(error) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
