/**
 * Condition Node Handler
 *
 * Evaluates condition branches in order and returns the first match.
 *
 * Template resolution
 * ───────────────────
 * leftValue and rightValue in structured conditions support mustache syntax:
 *   {{ctx.severity}}  →  resolved to the actual runtime value before comparison
 *
 * This means structured conditions use {{ctx.variable}} (same as all other nodes).
 *
 * The "JS Expression" operator is the exception — it runs raw JS in the VM
 * sandbox where `ctx` is a plain variable, so it still uses ctx.variable.
 *
 * Supported branch formats
 * ────────────────────────
 * New structured:
 *   branch = {
 *     id, label, conditionLogic: 'AND'|'OR',
 *     conditions: [{ id, leftValue: '{{ctx.x}}', operator: 'equals', rightValue: '3' }]
 *   }
 *
 * Legacy (backward-compat):
 *   branch = { id, condition: 'ctx.x > 3', expression: '…', … }
 */

const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');
const { createWorkflowVm } = require('./workflowVm');

// ─── Template resolution ───────────────────────────────────────────────────────

/**
 * Resolve a single value that may contain {{ctx.*}} mustache tokens.
 * Falls back to the raw string if resolveTemplate is not available.
 *
 * @param {string}   raw              — e.g. "{{ctx.severity}}" or "3"
 * @param {function} resolveTemplate  — from helpers (taskWorker binding)
 * @returns {*}  Resolved value (preserves original type for single expressions)
 */
function resolveValue(raw, resolveTemplate) {
  if (!resolveTemplate || typeof raw !== 'string') return raw;
  // resolveTemplate with preserveSingleExpressionType:true returns the
  // native type when the entire string is one {{…}} token
  return resolveTemplate(raw);
}

// ─── Comparison helpers ───────────────────────────────────────────────────────

function coerceNum(v) { return Number(v); }
function coerceStr(v) { return v == null ? '' : String(v); }

function isEmpty(v) {
  return v == null || v === '' || (Array.isArray(v) && v.length === 0);
}

/**
 * Compare two already-resolved runtime values using the given operator.
 * Returns a boolean; never throws.
 *
 * @param {*}      left
 * @param {string} operator
 * @param {*}      right
 * @returns {boolean}
 */
function compareValues(left, operator, right) {
  try {
    switch (operator) {
      case 'equals':
        return coerceStr(left) === coerceStr(right);

      case 'not_equals':
        return coerceStr(left) !== coerceStr(right);

      case 'contains':
        return coerceStr(left).includes(coerceStr(right));

      case 'not_contains':
        return !coerceStr(left).includes(coerceStr(right));

      case 'starts_with':
        return coerceStr(left).startsWith(coerceStr(right));

      case 'ends_with':
        return coerceStr(left).endsWith(coerceStr(right));

      case 'greater_than':
        return coerceNum(left) > coerceNum(right);

      case 'less_than':
        return coerceNum(left) < coerceNum(right);

      case 'greater_or_equal':
        return coerceNum(left) >= coerceNum(right);

      case 'less_or_equal':
        return coerceNum(left) <= coerceNum(right);

      case 'is_empty':
        return isEmpty(left);

      case 'is_not_empty':
        return !isEmpty(left);

      case 'matches_regex':
        return new RegExp(coerceStr(right)).test(coerceStr(left));

      default:
        return false;
    }
  } catch {
    return false;
  }
}

// ─── Branch evaluator ─────────────────────────────────────────────────────────

/**
 * Evaluate one branch given a resolveTemplate function and a VM for expressions.
 *
 * Structured conditions  → resolveTemplate + compareValues (no VM needed)
 * "expression" operator  → raw JS in VM sandbox (ctx.variable, no mustache)
 * Legacy string format   → raw JS in VM sandbox (backward compat)
 *
 * @param {object}   branch
 * @param {object}   vm              — vm2 instance
 * @param {function} resolveTemplate — from helpers
 * @returns {boolean}
 */
function evaluateBranch(branch, vm, resolveTemplate) {

  // ── New structured format ──────────────────────────────────────────────────
  if (Array.isArray(branch.conditions) && branch.conditions.length > 0) {
    const logic = (branch.conditionLogic || 'AND').toUpperCase();

    const results = branch.conditions.map(cond => {
      try {
        // "JS Expression" operator: raw JS in VM, ctx.variable syntax
        if (cond.operator === 'expression') {
          const expr = cond.leftValue || 'false';
          return vm.run(`Boolean(${expr})`) === true;
        }

        // All other operators: resolve {{ctx.*}} templates then compare directly
        const left = resolveValue(cond.leftValue ?? '', resolveTemplate);
        const right = resolveValue(cond.rightValue ?? '', resolveTemplate);
        return compareValues(left, cond.operator, right);

      } catch {
        return false;
      }
    });

    return logic === 'OR'
      ? results.some(Boolean)
      : results.every(Boolean);
  }

  // ── Legacy format ──────────────────────────────────────────────────────────
  const rawExpr =
    branch.condition ||
    branch.expression ||
    buildLegacyStructuredExpr(branch) ||
    'false';

  try {
    return vm.run(`Boolean(${rawExpr})`) === true;
  } catch {
    return false;
  }
}

// ─── Legacy expression builder ────────────────────────────────────────────────

/**
 * Reconstruct a JS expression from the old leftOperand/conditionType/rightOperand
 * fields so workflows saved before this version still evaluate correctly.
 *
 * @returns {string|null}
 */
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

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * @param {object}   nodeConfig
 * @param {Array}    nodeConfig.branches
 * @param {string}   [nodeConfig.defaultBranch]
 * @param {string}   [nodeConfig.errorHandling]
 * @param {object}   context
 * @param {object}   helpers               — provided by taskWorker
 * @param {function} helpers.resolveTemplate
 * @returns {Promise<{ output: object, nextHandle: string }>}
 */
async function execute(nodeConfig, context, helpers) {
  const {
    branches = [],
    defaultBranch = NEXT_HANDLE.DEFAULT,
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig ?? {};

  const { resolveTemplate } = helpers ?? {};

  try {
    // VM is only needed for the "JS Expression" operator and legacy branches.
    // It still receives ctx so legacy expressions like `ctx.x > 3` keep working.
    const vm = createWorkflowVm({ sandbox: { ctx: context }, timeoutMs: 5_000 });

    for (const branch of branches) {
      if (!branch.id) continue;

      const matched = evaluateBranch(branch, vm, resolveTemplate);

      if (matched) {
        return {
          output: {
            matched: branch.id,
            label: branch.label || branch.name || branch.id,
            success: true,
          },
          nextHandle: branch.id,
        };
      }
    }

    // No branch matched → default / else path
    return {
      output: { matched: defaultBranch, label: 'else', success: true },
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