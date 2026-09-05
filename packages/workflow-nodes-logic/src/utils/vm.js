/**
 * VM utilities — isolated-vm wrappers (lazy, fallback to Node vm if native missing)
 */
let _ivm = null;
function getIvm() {
  if (_ivm) return _ivm;
  try {
    _ivm = require('isolated-vm');
    return _ivm;
  } catch (_) {
    return null;
  }
}

function fallbackRun(code, sandbox, timeoutMs = 5000) {
  // Fallback using Node vm (less secure, but works for tests / when native missing)
  const vm = require('vm');
  const ctx = vm.createContext({ ...sandbox });
  const script = new vm.Script(code);
  return script.runInContext(ctx, { timeout: timeoutMs });
}

export function createWorkflowVm({ sandbox = {}, timeoutMs = 5000, memoryLimitMb = 128 }) {
  const ivm = getIvm();
  if (!ivm) {
    // Fallback
    return {
      run: (code) => fallbackRun(code, sandbox, timeoutMs),
    };
  }
  return {
    run: (code) => {
      const isolate = new ivm.Isolate({ memoryLimit: memoryLimitMb });
      try {
        const context = isolate.createContextSync();
        const jail = context.global;
        for (const [key, value] of Object.entries(sandbox)) {
          jail.setSync(key, new ivm.ExternalCopy(value).copyInto());
        }
        const script = isolate.compileScriptSync(code);
        return script.runSync(context, { timeout: timeoutMs, copy: true });
      } finally {
        isolate.dispose();
      }
    },
  };
}

export async function runInSandbox({ sandbox = {}, timeoutMs = 5000, memoryLimitMb = 128 }, code) {
  const ivm = getIvm();
  if (!ivm) {
    const vm = require('vm');
    const ctx = vm.createContext({ ...sandbox });
    const script = new vm.Script(code);
    const result = script.runInContext(ctx, { timeout: timeoutMs });
    if (result && typeof result.then === 'function') return await result;
    return result;
  }
  const isolate = new ivm.Isolate({ memoryLimit: memoryLimitMb });
  try {
    const context = isolate.createContextSync();
    const jail = context.global;
    for (const [key, value] of Object.entries(sandbox)) {
      jail.setSync(key, new ivm.ExternalCopy(value).copyInto());
    }
    const script = isolate.compileScriptSync(code);
    const result = await script.run(context, { timeout: timeoutMs, promise: true, copy: true });
    return result;
  } finally {
    isolate.dispose();
  }
}
