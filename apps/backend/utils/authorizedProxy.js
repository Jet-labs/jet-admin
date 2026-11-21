/**
 * Authorized Execution Proxies
 *
 * These are the ONLY legitimate entry points for executing data queries and
 * workflows. They enforce execution context requirements at the gate level:
 *
 *   1. An executionCtx is MANDATORY — calls without it are rejected.
 *   2. For user/apiKey callers: Casbin enforcement is run.
 *   3. For system callers (listeners, crons): the context is trusted but logged.
 *
 * ALL callers in the codebase — controllers, handlers, listeners, cron engine —
 * MUST use these proxies instead of the raw service functions.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  Controller  →  authorizedExecuteDataQuery()  →  executeDataQuery()       │
 * │  Workflow    →  authorizedExecuteDataQuery()  →  executeDataQuery()       │
 * │  Listener    →  authorizedExecuteDataQuery()  →  executeDataQuery()       │
 * │  Cron Job    →  authorizedExecuteWorkflow()   →  executeWorkflow()        │
 * └────────────────────────────────────────────────────────────────────────────┘
 */

const { enforce } = require("../config/casbin.config");
const {
  isSystemCaller,
  getCallerUserID,
  CALLER_TYPES,
} = require("./executionContext");
const Logger = require("./logger");
const { prisma } = require("../config/prisma.config");
const { isUUID } = require("validator");
const { keyValueTypeArrayToObject } = require("./json.util");
const { resolveInputs, extractQueryDefinitions, extractWorkflowDefinitions } = require("./input.util");
const { QueryEngine } = require("../modules/dataQuery/queryEngine/engine");
const { startWorkflowTemporal: startWorkflow } = require("../modules/workflow/temporal/service");

// ── Default Fetchers ──────────────────────────────────────────────────────────

async function defaultQueryFetcher(queryID, { tenantID } = {}) {
  return prisma.tblDataQueries.findFirst({
    // Tenant scoping is mandatory when a context is available. The fallback
    // keeps compatibility for internal callers that intentionally fetch by
    // globally-unique ID (e.g. tests), but execution paths always pass it.
    where: {
      dataQueryID: queryID,
      ...(tenantID ? { tenantID } : {}),
    },
  });
}

async function defaultDatasourceFetcher(datasourceID, { tenantID } = {}) {
  if (!datasourceID || !isUUID(datasourceID)) {
    return null;
  }
  const datasource = await prisma.tblDatasources.findFirst({
    where: {
      datasourceID,
      ...(tenantID ? { tenantID } : {}),
    },
  });
  if (datasource && datasource.datasourceOptions) {
    const { decrypt } = require("./encryption.util");
    if (datasource.datasourceOptions.__encrypted) {
      try {
        const decryptedStr = decrypt({
          iv: datasource.datasourceOptions.iv,
          data: datasource.datasourceOptions.data,
          authTag: datasource.datasourceOptions.authTag,
        });
        datasource.datasourceOptions = JSON.parse(decryptedStr);
      } catch (error) {
        Logger.log("error", {
          message: "defaultDatasourceFetcher:decryptionFailed",
          params: { datasourceID, error: error.message },
        });
      }
    }
  }
  return datasource;
}

function createQueryEngine({
  queryFetcher = defaultQueryFetcher,
  datasourceFetcher = defaultDatasourceFetcher,
} = {}) {
  return new QueryEngine(queryFetcher, datasourceFetcher);
}

// One engine per process so the result/datasource caches actually survive
// between executions. Previously every call constructed a fresh engine and
// the caches were discarded immediately, making them pure overhead.
let sharedQueryEngine = null;

function getSharedQueryEngine() {
  if (!sharedQueryEngine) {
    sharedQueryEngine = createQueryEngine();
  }
  return sharedQueryEngine;
}

/** Invalidate cached query results after a query is updated/deleted. */
function clearQueryEngineCache() {
  if (sharedQueryEngine) {
    sharedQueryEngine.clearCache();
  }
}

function buildDataQueryExecutionInputs(inputDefinitions = [], inputValues = {}) {
  const normalizedInputDefinitions = Array.isArray(inputDefinitions)
    ? inputDefinitions
    : [];

  const mappedInputsToValues = normalizedInputDefinitions.map((inputDef) => ({
    ...inputDef,
    value: inputValues?.[inputDef.key],
  }));

  return {
    mappedInputsToValues,
    kvtObject: keyValueTypeArrayToObject(mappedInputsToValues),
  };
}



// ── Data Query Proxy ─────────────────────────────────────────────────────────

/**
 * Authorized proxy for executing a data query.
 *
 * @param {object} params
 * @param {string}  params.dataQueryID         - ID of the query to execute
 * @param {object}  [params.engine]            - Optional pre-created QueryEngine
 * @param {Array}   [params.inputDefinitions]  - Input definitions from the query
 * @param {object}  [params.inputValues]       - User-supplied input values
 * @param {object}  [params.executionInputs]   - Pre-resolved inputs (skips resolution)
 * @param {number}  [params.timeoutSeconds]    - Per-node/per-workflow timeout
 *        override (seconds). Falls through to the query's own
 *        dataQueryOptions.timeoutSeconds, then the platform default.
 * @param {import("./executionContext").ExecutionContext} params.executionCtx
 *        REQUIRED. The execution context identifying who/what is running this query.
 *
 * @returns {Promise<any>} Query execution result
 * @throws {Error} If executionCtx is missing or authorization fails
 */
async function authorizedExecuteDataQuery({
  dataQueryID,
  engine,
  inputDefinitions,
  inputValues,
  executionInputs,
  executionCtx,
  timeoutSeconds,
}) {
  // ── Gate: context is mandatory ──────────────────────────────────────────
  if (!executionCtx) {
    const err = new Error(
      "authorizedExecuteDataQuery: executionCtx is required. " +
      "Direct calls to executeDataQuery are not allowed."
    );
    Logger.log("error", {
      message: "authorizedProxy:dataQuery:missingContext",
      params: { dataQueryID },
    });
    throw err;
  }

  const { tenantID, caller } = executionCtx;

  Logger.log("info", {
    message: "authorizedProxy:dataQuery:gate",
    params: {
      dataQueryID,
      callerType: caller?.type,
      callerID: caller?.id,
      tenantID,
      originatingResource: executionCtx.originatingResource,
    },
  });

  // ── Authorization check ─────────────────────────────────────────────────
  if (!isSystemCaller(executionCtx)) {
    // User or API key caller — enforce Casbin policy
    const subjectID = caller.id;
    const resource = `dataquery:${dataQueryID}`;

    const allowed = await enforce(subjectID, tenantID, resource, "execute");

    if (!allowed) {
      // Check if this is a delegated call (e.g., from a workflow or appPage)
      // If so, check if the user has permission on the originating resource
      if (executionCtx.originatingResource) {
        const originResource = `${executionCtx.originatingResource.type}:${executionCtx.originatingResource.id}`;
        const originAllowed = await enforce(
          subjectID,
          tenantID,
          originResource,
          "execute"
        );

        if (!originAllowed) {
          Logger.log("error", {
            message: "authorizedProxy:dataQuery:denied",
            params: {
              subjectID,
              tenantID,
              resource,
              originResource,
              reason: "No permission on query or originating resource",
            },
          });
          throw new Error(
            `Authorization denied: Cannot execute query ${dataQueryID}`
          );
        }

        Logger.log("info", {
          message: "authorizedProxy:dataQuery:delegatedAllow",
          params: { subjectID, tenantID, resource, originResource },
        });
      } else {
        Logger.log("error", {
          message: "authorizedProxy:dataQuery:denied",
          params: { subjectID, tenantID, resource, reason: "No direct permission" },
        });
        throw new Error(
          `Authorization denied: Cannot execute query ${dataQueryID}`
        );
      }
    }
  }
  // System callers (listeners, crons) are trusted — no Casbin check needed
  // Their identity and origin are already logged above

  // ── Execute via Engine ──────────────────────────────────────────────────
  try {
    const activeEngine = engine || getSharedQueryEngine();

    let finalRuntimeInputs = executionInputs;

    if (!finalRuntimeInputs) {
      let activeInputDefinitions = inputDefinitions;

      // If definitions weren't passed (e.g. from a raw dataQueryID execution), fetch them.
      // Must be tenant-scoped for the same reason as the engine fetcher.
      if (!activeInputDefinitions) {
        const queryData = await prisma.tblDataQueries.findFirst({
          where: { dataQueryID, tenantID },
        });
        activeInputDefinitions = queryData ? extractQueryDefinitions(queryData) : [];
      }

      // Resolve & validate inputs through the unified pipeline
      const { resolved, errors, valid } = await resolveInputs({
        type: 'query', inputDefinitions: activeInputDefinitions, inputValues: inputValues || {},
      });

      if (!valid) {
        Logger.log("error", {
          message: "authorizedProxy:dataQuery:inputValidationFailed",
          params: { dataQueryID, errors },
        });
        throw new Error(`Query input validation failed: ${JSON.stringify(errors)}`);
      }
      finalRuntimeInputs = resolved;
    }

    return await activeEngine.executeQuery(dataQueryID, finalRuntimeInputs, {
      timeoutSeconds,
      tenantID,
    });
  } catch (error) {
    Logger.log("error", {
      message: "authorizedProxy:dataQuery:executionError",
      params: { dataQueryID, error: error.message },
    });
    throw error;
  }
}

// ── Workflow Proxy ───────────────────────────────────────────────────────────

/**
 * Authorized proxy for executing a workflow.
 *
 * @param {object} params
 * @param {string}  params.workflowID    - ID of the workflow to execute
 * @param {string}  params.tenantID      - Tenant ID
 * @param {object}  [params.inputValues] - Input parameters for the workflow
 * @param {import("./executionContext").ExecutionContext} params.executionCtx
 *        REQUIRED. The execution context identifying who/what is running this workflow.
 *
 * @returns {Promise<{instanceID: string}>} Workflow instance
 * @throws {Error} If executionCtx is missing or authorization fails
 */
async function authorizedExecuteWorkflow({
  workflowID,
  tenantID,
  inputValues = {},
  executionCtx,
  executionKey,
}) {
  // ── Gate: context is mandatory ──────────────────────────────────────────
  if (!executionCtx) {
    const err = new Error(
      "authorizedExecuteWorkflow: executionCtx is required. " +
      "Direct calls to workflowService.executeWorkflow are not allowed."
    );
    Logger.log("error", {
      message: "authorizedProxy:workflow:missingContext",
      params: { workflowID, tenantID },
    });
    throw err;
  }

  const { caller } = executionCtx;
  if (executionKey && !isSystemCaller(executionCtx)) throw new Error('Stable workflow execution keys are reserved for trusted system dispatch');

  Logger.log("info", {
    message: "authorizedProxy:workflow:gate",
    params: {
      workflowID,
      tenantID,
      callerType: caller?.type,
      callerID: caller?.id,
      originatingResource: executionCtx.originatingResource,
    },
  });

  // ── Authorization check ─────────────────────────────────────────────────
  if (!isSystemCaller(executionCtx)) {
    // User or API key caller — enforce Casbin policy
    const subjectID = caller.id;
    const resource = `workflow:${workflowID}`;

    const allowed = await enforce(subjectID, tenantID, resource, "execute");

    if (!allowed) {
      // Check if this is a delegated call (e.g., from an appPage)
      // If so, check if the user has permission on the originating resource
      if (executionCtx.originatingResource) {
        const originResource = `${executionCtx.originatingResource.type}:${executionCtx.originatingResource.id}`;
        const originAllowed = await enforce(
          subjectID,
          tenantID,
          originResource,
          "execute"
        );

        if (!originAllowed) {
          Logger.log("error", {
            message: "authorizedProxy:workflow:denied",
            params: {
              subjectID,
              tenantID,
              resource,
              originResource,
              reason: "No permission on workflow or originating resource",
            },
          });
          throw new Error(
            `Authorization denied: Cannot execute workflow ${workflowID}`
          );
        }

        Logger.log("info", {
          message: "authorizedProxy:workflow:delegatedAllow",
          params: { subjectID, tenantID, resource, originResource },
        });
      } else {
        Logger.log("error", {
          message: "authorizedProxy:workflow:denied",
          params: { subjectID, tenantID, resource, reason: "No direct permission" },
        });
        throw new Error(
          `Authorization denied: Cannot execute workflow ${workflowID}`
        );
      }
    }
  }
  // System callers (listeners, crons) are trusted

  // ── Execute via Workflow Engine ─────────────────────────────────────────
  try {
    // Resolve & validate inputs through the unified pipeline. The workflow
    // lookup is tenant-scoped: a system caller (cron/listener) must not be
    // able to start a workflow owned by another tenant by ID alone.
    const workflow = await prisma.tblWorkflows.findFirst({
      where: { workflowID, tenantID },
    });
    if (!workflow) {
      throw new Error("Workflow not found or unauthorized");
    }
    const inputDefinitions = extractWorkflowDefinitions(workflow);
    const { resolved, errors, valid } = await resolveInputs({
      type: 'workflow', inputDefinitions, inputValues: inputValues,
    });

    if (!valid) {
      Logger.log("error", {
        message: "authorizedProxy:workflow:inputValidationFailed",
        params: { workflowID, errors },
      });
      throw new Error(`Workflow input validation failed: ${JSON.stringify(errors)}`);
    }

    // Start workflow with resolved inputs
    const result = await startWorkflow({ workflowID, tenantID, inputValues: resolved, ...(executionKey ? { executionKey } : {}) });

    Logger.log("success", {
      message: "authorizedProxy:workflow:started",
      params: { instanceID: result.instanceID },
    });

    return result;
  } catch (error) {
    Logger.log("error", {
      message: "authorizedProxy:workflow:failure",
      params: { workflowID, error: error.message },
    });
    throw error;
  }
}

module.exports = {
  authorizedExecuteDataQuery,
  authorizedExecuteWorkflow,
  createQueryEngine,
  getSharedQueryEngine,
  clearQueryEngineCache,
  defaultDatasourceFetcher,
};
