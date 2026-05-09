/**
 * Listener Transformer VM
 * Sandboxed JavaScript execution environment for user-defined event transforms.
 * Uses isolated-vm (same as workflowVm.js) with tighter constraints for real-time processing.
 *
 * The script receives `event` in scope and must return the transformed event.
 * Returning null/undefined filters the event out (drops it).
 */
const ivm = require('isolated-vm');
const Logger = require('../../../utils/logger');

const TRANSFORM_TIMEOUT_MS = 100;     // tight — transforms must be fast
const TRANSFORM_MEMORY_MB = 16;       // minimal memory for simple transforms

class ListenerTransformerVm {
  /**
   * Execute a user-defined transform script against an incoming event.
   *
   * @param {string} script - User-authored JS transform
   * @param {object} event - Raw incoming event from the datasource
   * @returns {{ output: object|null, error: string|null }}
   */
  static execute(script, event) {
    if (!script || !script.trim()) {
      return { output: event, error: null };
    }

    const isolate = new ivm.Isolate({ memoryLimit: TRANSFORM_MEMORY_MB });
    try {
      const context = isolate.createContextSync();
      const jail = context.global;

      // Inject `event` as a deep-copied global
      jail.setSync('event', new ivm.ExternalCopy(event).copyInto());

      // Wrap in IIFE so the user script can use `return`
      const wrapped = `(function() { ${script} })()`;
      const compiled = isolate.compileScriptSync(wrapped);
      const result = compiled.runSync(context, { timeout: TRANSFORM_TIMEOUT_MS, copy: true });

      return { output: result ?? null, error: null };
    } catch (err) {
      Logger.log('error', {
        message: 'ListenerTransformerVm:execute:error',
        params: { error: err.message },
      });
      return { output: null, error: err.message };
    } finally {
      isolate.dispose();
    }
  }
}

module.exports = { ListenerTransformerVm };
