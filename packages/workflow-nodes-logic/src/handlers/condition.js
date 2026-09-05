import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';
import { createWorkflowVm } from '../utils/vm.js';

export function resolveValue(raw, resolveTemplate) {
  if (!resolveTemplate || typeof raw !== 'string') return raw;
  return resolveTemplate(raw);
}
function coerceNum(v) { return Number(v); }
function coerceStr(v) { return v == null ? '' : String(v); }
function isEmpty(v) { return v == null || v === '' || (Array.isArray(v) && v.length === 0); }
export function compareValues(left, operator, right) {
  try {
    switch (operator) {
      case 'equals': return coerceStr(left) === coerceStr(right);
      case 'not_equals': return coerceStr(left) !== coerceStr(right);
      case 'contains': return coerceStr(left).includes(coerceStr(right));
      case 'not_contains': return !coerceStr(left).includes(coerceStr(right));
      case 'starts_with': return coerceStr(left).startsWith(coerceStr(right));
      case 'ends_with': return coerceStr(left).endsWith(coerceStr(right));
      case 'greater_than': return coerceNum(left) > coerceNum(right);
      case 'less_than': return coerceNum(left) < coerceNum(right);
      case 'greater_or_equal': return coerceNum(left) >= coerceNum(right);
      case 'less_or_equal': return coerceNum(left) <= coerceNum(right);
      case 'is_empty': return isEmpty(left);
      case 'is_not_empty': return !isEmpty(left);
      case 'matches_regex': return new RegExp(coerceStr(right)).test(coerceStr(left));
      default: return false;
    }
  } catch { return false; }
}
function evaluateBranch(branch, vm, resolveTemplate) {
  if (Array.isArray(branch.conditions) && branch.conditions.length > 0) {
    const logic = (branch.conditionLogic || 'AND').toUpperCase();
    const results = branch.conditions.map(cond => {
      try {
        if (cond.operator === 'expression') {
          const expr = cond.leftValue || 'false';
          return vm.run(`Boolean(${expr})`) === true;
        }
        const left = resolveValue(cond.leftValue ?? '', resolveTemplate);
        const right = resolveValue(cond.rightValue ?? '', resolveTemplate);
        return compareValues(left, cond.operator, right);
      } catch { return false; }
    });
    return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  }
  const rawExpr = branch.condition || branch.expression || buildLegacyStructuredExpr(branch) || 'false';
  try { return vm.run(`Boolean(${rawExpr})`) === true; } catch { return false; }
}
function buildLegacyStructuredExpr(branch) {
  const L = branch.leftOperand;
  if (!L) return null;
  const R = JSON.stringify(String(branch.rightOperand ?? ''));
  switch (branch.conditionType) {
    case 'equals': return `String(${L}) === String(${R})`;
    case 'not_equals': return `String(${L}) !== String(${R})`;
    case 'contains': return `String(${L}).includes(${R})`;
    case 'greater_than': return `Number(${L}) > Number(${R})`;
    case 'less_than': return `Number(${L}) < Number(${R})`;
    case 'is_empty': return `(${L} == null || ${L} === '')`;
    case 'is_not_empty': return `!(${L} == null || ${L} === '')`;
    case 'regex': return `(() => { try { return new RegExp(${R}).test(String(${L})); } catch(e){ return false; } })()`;
    default: return null;
  }
}

export async function executeCondition(nodeConfig, context, helpers = {}) {
  const { branches = [], defaultBranch = NEXT_HANDLE.DEFAULT, errorHandling = ERROR_HANDLING.CONTINUE } = nodeConfig ?? {};
  const { resolveTemplate } = helpers;
  try {
    const vm = createWorkflowVm({ sandbox: { ctx: context }, timeoutMs: 5000 });
    for (const branch of branches) {
      if (!branch.id) continue;
      const matched = evaluateBranch(branch, vm, resolveTemplate);
      if (matched) {
        return {
          output: { matched: branch.id, label: branch.label || branch.name || branch.id, success: true },
          nextHandle: branch.id,
        };
      }
    }
    return {
      output: { matched: defaultBranch, label: 'else', success: true },
      nextHandle: defaultBranch,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { matched: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
