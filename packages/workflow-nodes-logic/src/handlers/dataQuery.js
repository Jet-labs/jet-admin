import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

/**
 * DataQuery handler — logic package version
 * Requires injected services for DB access (to keep package pure).
 * @param {object} nodeConfig
 * @param {object} context
 * @param {object} helpers — { resolveTemplate, tenantID, instanceID, workflowID }
 * @param {object} services — { authorizedExecuteDataQuery, resolveInputs, createSystemContext, ORIGIN_TYPES }
 */
export async function executeDataQuery(nodeConfig, context, helpers = {}, services = {}) {
  const {
    dataQueryID,
    inputValues = {},
    outputVariable = 'queryResult',
    errorHandling = ERROR_HANDLING.CONTINUE,
    // Effective timeout after node > workflow > platform resolution
    // (materialized by service.js; workflow re-resolves defensively).
    timeoutSeconds,
  } = nodeConfig || {};

  if (!dataQueryID) throw new Error('Data Query node requires dataQueryID');

  const { resolveInputs, authorizedExecuteDataQuery, createSystemContext, deriveChildContext, ORIGIN_TYPES } = services;

  // If services not injected (e.g. direct package test), throw
  if (!authorizedExecuteDataQuery || !resolveInputs) {
    throw new Error('dataQuery handler requires services.authorizedExecuteDataQuery and services.resolveInputs');
  }

  const { resolveTemplate } = helpers;
  const tenantID = helpers.tenantID;
  const workflowID = helpers.workflowID;
  const instanceID = helpers.instanceID;

  // Resolve inputs via unified pipeline (supports {{ctx.*}} templates)
  const { resolved, errors, valid } = await resolveInputs({
    type: 'query',
    id: dataQueryID,
    inputValues,
    contextData: { ctx: context },
  });

  if (!valid) throw new Error(`Data query input validation failed: ${JSON.stringify(errors)}`);

  let executionCtx;
  if (context?.__executionCtx && deriveChildContext) {
    executionCtx = deriveChildContext(context.__executionCtx, ORIGIN_TYPES.WORKFLOW, workflowID);
  } else if ((workflowID || tenantID) && createSystemContext) {
    executionCtx = createSystemContext(ORIGIN_TYPES.WORKFLOW, workflowID || instanceID, tenantID);
  }

  try {
    const result = await authorizedExecuteDataQuery({
      dataQueryID,
      executionInputs: resolved,
      executionCtx,
      // Per-node/per-workflow override; engine falls back to the query's own
      // dataQueryOptions.timeoutSeconds, then the platform default (60s).
      ...(timeoutSeconds !== undefined && timeoutSeconds !== null && timeoutSeconds !== ''
        ? { timeoutSeconds }
        : {}),
    });
    return {
      output: { [outputVariable]: result, success: true },
      nextHandle: NEXT_HANDLE.SUCCESS,
    };
  } catch (error) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw error;
    return {
      output: { [outputVariable]: null, success: false, error: serializeError(error) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
