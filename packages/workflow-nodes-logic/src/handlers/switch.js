import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';
import { createWorkflowVm } from '../utils/vm.js';
import { compareValues, resolveValue } from './condition.js';

/**
 * Switch handler — value-based multi-branch routing.
 * Resolves `switchValue` (template or literal), then returns the first case
 * whose match rule holds. Falls back to the `default` handle.
 *
 * Config:
 *  - switchValue: string (usually `{{ctx.someVar}}`) or literal
 *  - cases: [{ id, label, operator, matchValue }]
 *    operator: 'equals' (default) | 'not_equals' | 'contains' |
 *      'greater_than' | 'less_than' | 'expression' (matchValue is raw JS
 *      with `ctx` in scope, same convention as the condition node)
 *  - errorHandling
 */
export async function executeSwitch(nodeConfig, context, helpers = {}) {
  const {
    switchValue,
    cases = [],
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};
  const { resolveTemplate } = helpers;
  try {
    const vm = createWorkflowVm({ sandbox: { ctx: context }, timeoutMs: 5000 });
    const value = resolveValue(switchValue, resolveTemplate);
    for (const c of cases) {
      if (!c || !c.id) continue;
      const operator = c.operator || 'equals';
      let matched = false;
      try {
        if (operator === 'expression') {
          const expr = c.matchValue || 'false';
          matched = vm.run(`Boolean(${expr})`) === true;
        } else {
          const right = resolveValue(c.matchValue ?? '', resolveTemplate);
          matched = compareValues(value, operator, right);
        }
      } catch { matched = false; }
      if (matched) {
        return {
          output: { matched: c.id, label: c.label || c.id, value, success: true },
          nextHandle: c.id,
        };
      }
    }
    return {
      output: { matched: NEXT_HANDLE.DEFAULT, label: 'default', value, success: true },
      nextHandle: NEXT_HANDLE.DEFAULT,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { matched: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
