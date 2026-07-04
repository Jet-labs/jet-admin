/**
 * JavaScript Node Handler
 * Executes user-provided JavaScript in a sandboxed VM with timeout enforcement.
 *
 * The code runs inside an IIFE so `return` statements work as expected.
 * Both synchronous and async (Promise-returning) results are supported.
 */

const { ERROR_HANDLING, NEXT_HANDLE, serializeError } = require('./constants');
const { runInSandbox } = require('./workflowVm');
const Logger = require('../../../utils/logger');

/**
 * @param {object} nodeConfig
 * @param {string} nodeConfig.code
 * @param {string} [nodeConfig.outputVariable='jsResult']
 * @param {number} [nodeConfig.timeoutSeconds=30]
 * @param {string} [nodeConfig.errorHandling]
 * @param {object} context
 * @returns {Promise<{ output: object, nextHandle: string }>}
 */
async function execute(nodeConfig, context) {
  const {
    code,
    outputVariable = 'jsResult',
    timeoutSeconds = 30,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};

  Logger.log('info', {
    message: 'javascriptHandler:execute:params',
    params: { outputVariable, timeoutSeconds, hasCode: !!code },
  });

  if (!code) {
    throw new Error('JavaScript node requires a non-empty `code` field');
  }

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
    Logger.log('error', {
      message: 'javascriptHandler:execute:error',
      params: { outputVariable, error: err.message },
    });
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;

    return {
      output: { [outputVariable]: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };