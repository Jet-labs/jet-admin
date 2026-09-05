import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

/**
 * Sub-Workflow handler — runs a saved child workflow synchronously and maps
 * its result back into the parent context ("sub-playbook").
 *
 * Context model (isolated by design):
 *  - The child sees ONLY `inputMapping` (resolved against the parent ctx) as
 *    its `ctx.input`. It never sees the parent context.
 *  - The parent receives `{ [outputVariable], childInstanceID, childStatus }`.
 *    With `mergeOutputs: true`, the child's public top-level outputs are also
 *    spread into the parent context (child wins, except `input` which is never
 *    overwritten).
 *
 * Depth guard: the parent context carries `__subDepth` (0 at top level). The
 * handler refuses to run when `__subDepth + 1 > maxDepth`, and refuses direct
 * self-reference (`childWorkflowID === helpers.workflowID`).
 *
 * Actual child execution is delegated to the injected
 * `services.runSubWorkflow` (backend Temporal service) to keep this package
 * pure and Temporal-friendly.
 *
 * @param {object} nodeConfig
 * @param {object} context — parent workflow context (ctx)
 * @param {object} helpers — { resolveTemplate, tenantID, instanceID, workflowID, nodeID }
 * @param {object} services — { runSubWorkflow }
 */
export async function executeSubWorkflow(nodeConfig, context, helpers = {}, services = {}) {
  const {
    childWorkflowID,
    inputMapping = {},
    outputVariable = 'subResult',
    mergeOutputs = false,
    maxDepth = 5,
    errorHandling = ERROR_HANDLING.FAIL_WORKFLOW,
  } = nodeConfig ?? {};

  const failOrContinue = (err) => {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { [outputVariable]: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  };

  try {
    if (!childWorkflowID) {
      throw new Error('Sub-Workflow node requires `childWorkflowID` — pick a saved workflow.');
    }
    // Direct self-reference would recurse forever; deeper cycles are caught by maxDepth.
    if (helpers.workflowID && String(childWorkflowID) === String(helpers.workflowID)) {
      throw new Error('Sub-Workflow node cannot call its own parent workflow (self-reference).');
    }
    const depth = Number(context?.__subDepth ?? 0);
    const limit = Number(maxDepth ?? 5);
    if (Number.isFinite(depth) && Number.isFinite(limit) && depth + 1 > limit) {
      throw new Error(`Sub-Workflow max depth exceeded (depth ${depth + 1} > maxDepth ${limit}).`);
    }
    if (!services.runSubWorkflow) {
      throw new Error('subWorkflow handler requires services.runSubWorkflow');
    }

    // Resolve mapping values against the PARENT context. Plain strings without
    // {{ }} pass through untouched; {{ctx.*}} singles keep their native type.
    const { resolveTemplate } = helpers;
    const childInputs = {};
    for (const [key, raw] of Object.entries(inputMapping || {})) {
      if (!key) continue;
      try {
        childInputs[key] = typeof raw === 'string' && resolveTemplate ? resolveTemplate(raw) : raw;
      } catch (err) {
        throw new Error(`Sub-Workflow input "${key}": template resolution failed: ${err?.message || err}`);
      }
    }

    const child = await services.runSubWorkflow({
      childWorkflowID,
      inputValues: childInputs,
      tenantID: helpers.tenantID,
      parentInstanceID: helpers.instanceID,
      parentNodeID: helpers.nodeID || null,
      depth: Number.isFinite(depth) ? depth : 0,
      isTest: Boolean(context?.__isTestRun),
    });

    if (!child || child.status !== 'COMPLETED') {
      const err = new Error(
        `Child workflow ${childWorkflowID} ended with status ${child?.status || 'UNKNOWN'}` +
          (child?.errorMessage ? `: ${child.errorMessage}` : '')
      );
      if (child?.childInstanceID) err.childInstanceID = child.childInstanceID;
      throw err;
    }

    const output = {
      [outputVariable]: child.output ?? null,
      childInstanceID: child.childInstanceID,
      childStatus: child.status,
      success: true,
    };

    // Opt-in merge-back: spread the child's public outputs into the parent
    // context payload so downstream nodes can use them directly. The engine
    // merges activity output into ctx; `input` is excluded so the parent's
    // own inputs can never be clobbered by a child.
    if (mergeOutputs && child.contextSnapshot && typeof child.contextSnapshot === 'object') {
      for (const [k, v] of Object.entries(child.contextSnapshot)) {
        if (k === 'input' || k.startsWith('__')) continue;
        if (!(k in output)) output[k] = v;
      }
    }

    return { output, nextHandle: NEXT_HANDLE.SUCCESS };
  } catch (err) {
    return failOrContinue(err);
  }
}
