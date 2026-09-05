/**
 * Loop handler — retained for reference but Temporal uses native for-loop in DSL workflow.
 * This file documents the legacy iterative contract; new code should prefer native loop in dslWorkflow.
 * Kept for unit test compatibility if needed.
 */
import { ERROR_HANDLING, NEXT_HANDLE } from '../constants.js';

export async function executeLoop(nodeConfig, context, helpers = {}) {
  const { resolveTemplate } = helpers;
  const nodeID = helpers?.nodeID || 'unknown';
  const {
    sourceVariable,
    itemVariable = 'item',
    indexVariable = 'index',
    outputVariable = 'loopResults',
    maxIterations = 1000,
  } = nodeConfig || {};

  // Simplified: Temporal DSL will handle loop natively, this is a stub for direct handler tests
  const items = context[sourceVariable] ?? (resolveTemplate ? resolveTemplate(sourceVariable) : undefined);
  const arr = Array.isArray(items) ? items : items == null ? [] : [items];
  if (arr.length > maxIterations) throw new Error(`Loop source has ${arr.length} items, exceeding maxIterations ${maxIterations}`);
  return {
    output: { [outputVariable]: [], totalItems: arr.length, success: true, _loopItems: arr, _itemVar: itemVariable, _indexVar: indexVariable },
    nextHandle: arr.length === 0 ? NEXT_HANDLE.COMPLETED : NEXT_HANDLE.LOOP,
  };
}
