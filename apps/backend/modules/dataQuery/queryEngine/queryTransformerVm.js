/**
 * Query Transformer VM
 * Sandboxed JavaScript execution environment for user-defined query result transforms.
 * Uses isolated-vm (same as ListenerTransformerVm) with constraints tuned for
 * potentially larger result sets.
 *
 * The script receives `data` in scope (the raw query result) and must return
 * the transformed result. Returning null/undefined passes through the original data.
 */
const ivm = require('isolated-vm');
const Logger = require('../../../utils/logger');

const TRANSFORM_TIMEOUT_MS = 5000;    // generous — results can be large
const TRANSFORM_MEMORY_MB = 64;       // allow reasonable result-set processing

class QueryTransformerVm {
  /**
   * Execute a user-defined transform script against a query result.
   *
   * @param {string} script - User-authored JS transform
   * @param {any}    data   - Raw query result (rows array, object, etc.)
   * @returns {{ output: any, error: string|null }}
   */
  static execute(script, data) {
    if (!script || !script.trim()) {
      return { output: data, error: null };
    }

    const isolate = new ivm.Isolate({ memoryLimit: TRANSFORM_MEMORY_MB });
    try {
      const context = isolate.createContextSync();
      const jail = context.global;

      // Inject `data` as a deep-copied global
      jail.setSync('data', new ivm.ExternalCopy(data).copyInto());

      // Wrap in IIFE so the user script can use `return`
      const wrapped = `(function() { ${script} })()`;
      const compiled = isolate.compileScriptSync(wrapped);
      const result = compiled.runSync(context, { timeout: TRANSFORM_TIMEOUT_MS, copy: true });

      return { output: result ?? data, error: null };
    } catch (err) {
      Logger.log('error', {
        message: 'QueryTransformerVm:execute:error',
        params: { error: err.message },
      });
      return { output: data, error: err.message };
    } finally {
      isolate.dispose();
    }
  }
}

module.exports = { QueryTransformerVm };
