import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';
import { runInSandbox } from '../utils/vm.js';

export async function executeJavascript(nodeConfig, context) {
  const {
    code,
    outputVariable = 'jsResult',
    timeoutSeconds = 30,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};

  if (!code) throw new Error('JavaScript node requires a non-empty `code` field');

  const timeoutMs = timeoutSeconds * 1000;
  try {
    const result = await runInSandbox(
      { sandbox: { ctx: context }, timeoutMs },
      `(function() { ${code} })()`
    );
    return {
      output: { [outputVariable]: result, success: true },
      nextHandle: NEXT_HANDLE.SUCCESS,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { [outputVariable]: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
