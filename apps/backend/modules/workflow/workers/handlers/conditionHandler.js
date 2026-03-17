/**
 * Condition Node Handler
 * Evaluates a list of condition branches in order and returns the first match.
 *
 * Improvement: creates a single VM instance per execute() call (not one per
 * branch), which avoids repeated context/sandbox allocation overhead.
 */

const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');
const { createWorkflowVm } = require('./workflowVm');

/**
 * @param {object} nodeConfig
 * @param {Array<{ id: string, condition: string }>} nodeConfig.branches
 * @param {string} [nodeConfig.defaultBranch]
 * @param {string} [nodeConfig.errorHandling]
 * @param {object} context
 * @returns {Promise<{ output: object, nextHandle: string }>}
 */
async function execute(nodeConfig, context) {
  const {
    branches = [],
    defaultBranch = NEXT_HANDLE.DEFAULT,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};

  try {
    // One VM for the entire evaluate loop — avoids per-branch allocation
    const vm = createWorkflowVm({ sandbox: { ctx: context }, timeoutMs: 5_000 });

    for (const { id, condition } of branches) {
      if (!id || !condition) continue;

      try {
        const matched = vm.run(`Boolean(${condition})`);

        if (matched === true) {
          return {
            output: { matched: id, condition, success: true },
            nextHandle: id,
          };
        }
      } catch {
      // A single failing condition does not abort the whole node;
      // we continue to the next branch
        continue;
      }
    }

    // No branch matched — use default
    return {
      output: { matched: defaultBranch, condition: 'default', success: true },
      nextHandle: defaultBranch,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;

    return {
      output: { matched: null, success: false, error: err.message },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };