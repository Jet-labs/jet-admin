/**
 * executeNodeActivity — single unified node execution activity.
 * Delegates to @jet-admin/workflow-nodes-logic executeNode for all types.
 */
const Logger = require('../../../../utils/logger');
const { buildResolveTemplate } = require('./resolveTemplate');

/**
 * @param {object} params.node — { id, type, data }
 * @param {object} params.context — workflow context snapshot
 */
async function executeNodeActivity({ node, context, tenantID, instanceID, workflowID }) {
  // Workspace dependency — must be installed via root `npm install`.
  let executeNode;
  try {
    ({ executeNode } = require('@jet-admin/workflow-nodes-logic'));
  } catch (err) {
    throw new Error(
      `@jet-admin/workflow-nodes-logic not resolvable: ${err.message}. ` +
      `Run \`npm install\` at repo root so workspaces link packages/workflow-nodes-logic.`
    );
  }
  const { resolveInputs } = require('../../../../utils/input.util');
  const { authorizedExecuteDataQuery } = require('../../../../utils/authorizedProxy');
  const { runSubWorkflowAndWait } = require('../service');
  const { createSystemContext, deriveChildContext, ORIGIN_TYPES } = require('../../../../utils/executionContext');

  const nodeID = node.id;
  const nodeType = node.type;

  Logger.log('info', {
    message: 'temporal:activity:executeNode',
    params: { instanceID, nodeID, nodeType },
  });

  const resolveTemplate = buildResolveTemplate(context, {
    instanceID,
    workflowID,
    nodeID,
    nodeType,
  });

  const helpers = { instanceID, nodeID, workflowID, tenantID, resolveTemplate };

  // A sub-workflow side effect needs a stable invocation identity. Temporal
  // activity IDs are deterministic across retries and unique per loop call,
  // so an accepted-but-unacknowledged start resumes the SAME child instead of
  // creating a duplicate (or orphan) child instance.
  let childExecutionKey = null;
  if (nodeType === 'subWorkflow') {
    try {
      const { Context } = require('@temporalio/activity');
      const info = Context.current().info;
      childExecutionKey = `subflow:${info.workflowExecution.runId}:${info.activityId}`;
    } catch (_) {
      childExecutionKey = null;
    }
  }

  const services = {
    resolveInputs,
    authorizedExecuteDataQuery,
    ...(childExecutionKey
      ? { runSubWorkflow: (params) => runSubWorkflowAndWait({ ...params, executionKey: childExecutionKey }) }
      : { runSubWorkflow: runSubWorkflowAndWait }),
    createSystemContext,
    deriveChildContext,
    ORIGIN_TYPES,
  };

  let executionCtx = context?.__executionCtx;
  if (!executionCtx && (workflowID || tenantID)) {
    executionCtx = createSystemContext(ORIGIN_TYPES.WORKFLOW, workflowID || instanceID, tenantID);
  }
  const ctxWithExec = executionCtx ? { ...context, __executionCtx: executionCtx } : context;

  try {
    return await executeNode({ node, context: ctxWithExec, helpers, services });
  } catch (err) {
    // Deterministic user-code errors fail fast (no Temporal retry).
    // Message regex is the cross-boundary signal — prototypes don't survive serialization.
    const isDeterministic =
      /is not defined|is not a function|Unexpected token|SyntaxError/.test(err?.message || String(err));
    if (isDeterministic || err?.childInstanceID) {
      const { ApplicationFailure } = require('@temporalio/activity');
      throw ApplicationFailure.create({
        message: err.message,
        type: err.name || 'Error',
        nonRetryable: isDeterministic,
        details: err.childInstanceID ? [{ childInstanceID: err.childInstanceID, childStatus: err.childStatus }] : [],
      });
    }
    throw err;
  }
}

module.exports = { executeNodeActivity };
