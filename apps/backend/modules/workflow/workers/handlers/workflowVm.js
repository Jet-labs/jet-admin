const ivm = require('isolated-vm');

/**
 * Execute code in an isolated V8 sandbox.
 *
 * @param {object} options
 * @param {object} options.sandbox  — key/value pairs exposed as globals
 * @param {number} options.timeoutMs — hard CPU-time limit (kills the thread)
 * @param {number} options.memoryLimitMb — heap limit per isolate (default 128 MB)
 * @param {string} code — JavaScript source to execute
 * @returns {*} the script's return value (transferable primitives/plain objects)
 */
function runInSandbox({ sandbox = {}, timeoutMs = 5000, memoryLimitMb = 128 }, code) {
  const isolate = new ivm.Isolate({ memoryLimit: memoryLimitMb });
  try {
    const context = isolate.createContextSync();
    const jail = context.global;

    // Inject sandbox values as deep-copied globals
    for (const [key, value] of Object.entries(sandbox)) {
      jail.setSync(key, new ivm.ExternalCopy(value).copyInto());
    }

    const script = isolate.compileScriptSync(code);
    const result = script.runSync(context, { timeout: timeoutMs });

    return result;
  } finally {
    isolate.dispose();
  }
}

module.exports = {
  runInSandbox,
};