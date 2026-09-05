/**
 * WorkflowService
 * Business logic for Workflow management.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const {
  formatAuthContextForLog,
  getCreationContextFromAuthContext,
} = require("../../utils/auth.context.utils");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");

function mapWorkflowNodeForPersistence(node, workflowID) {
  return {
    nodeID: node.id,
    workflowID,
    nodeType: node.type,
    nodeConfig: {
      ...node.data,
      position: node.position,
      width: node.width,
      height: node.height,
      measured: node.measured,
    },
  };
}

function mapWorkflowEdgeForPersistence(edge, workflowID) {
  return {
    workflowID,
    upstreamNodeID: edge.source,
    downstreamNodeID: edge.target,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
    edgeType: edge.type || 'smoothstep',
    edgeConfig: {
      label: edge.label,
      style: edge.style,
      animated: edge.animated,
      data: edge.data,
    },
  };
}

function buildWorkflowGraphPersistencePayload({ workflowID, nodes = [], edges = [] }) {
  return {
    nodeCreateManyData: nodes.map((node) => mapWorkflowNodeForPersistence(node, workflowID)),
    edgeCreateManyData: edges.map((edge) => mapWorkflowEdgeForPersistence(edge, workflowID)),
  };
}

const workflowService = {}

/**
 * Fetch all workflows for a tenant.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
workflowService.getAllWorkflows = async ({ userID, tenantID, search, page, pageSize, folderID, authContext }) => {
  Logger.log("info", {
    message: "workflowService:getAllWorkflows:params",
    params: {
      userID,
      tenantID,
      search,
      page,
      pageSize,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    const where = {
      tenantID: tenantID,
    };

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (folderID) {
      where.folderID = folderID;
    }

    const findManyOptions = {
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tblWorkflowNodes: true,
        tblWorkflowEdge: true,
      },
    };

    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [workflows, totalCount] = await Promise.all([
      prisma.tblWorkflows.findMany(findManyOptions),
      prisma.tblWorkflows.count({ where }),
    ]);

    Logger.log("success", {
      message: "workflowService:getAllWorkflows:success",
      params: {
        userID,
        workflowLength: workflows?.length,
        totalCount,
      },
    });

    return {
      workflows,
      totalCount,
      page: page || 1,
      pageSize: pageSize || workflows.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:getAllWorkflows:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
}

/**
 * Get workflow by ID with nodes and edges.
 */
workflowService.getWorkflowByID = async ({ workflowID, tenantID }) => {
  const workflow = await prisma.tblWorkflows.findFirst({
    where: { workflowID, tenantID },
    include: {
      tblWorkflowNodes: true,
      tblWorkflowEdge: true,
    },
  });
  return workflow;
};

/**
 * Create a new workflow.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.title
 * @param {JSON} param0.nodes
 * @param {JSON} param0.edges
 * @param {JSON} param0.workflowOptions
 * @returns {Promise<object>}
 */
workflowService.createWorkflow = async ({ userID, tenantID, title, nodes, edges, workflowOptions, authContext }) => {
  Logger.log("info", {
    message: "workflowService:createWorkflow:params",
    params: {
      userID,
      tenantID,
      title,
      nodes,
      edges,
      workflowOptions,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const workflowCreationTransaction = await prisma.$transaction(async (tx) => {
      const workflow = await tx.tblWorkflows.create({
        data: {
          tenantID: tenantID,
          title,
          creatorID: finalCreatorID,
          createdByApiKeyID,
          workflowOptions: workflowOptions || {},
        },
      });
      const { nodeCreateManyData, edgeCreateManyData } = buildWorkflowGraphPersistencePayload({
        workflowID: workflow.workflowID,
        nodes,
        edges,
      });

      if (nodeCreateManyData.length > 0) {
        await tx.tblWorkflowNodes.createMany({
          data: nodeCreateManyData,
        });
      }

      if (edgeCreateManyData.length > 0) {
        await tx.tblWorkflowEdge.createMany({
          data: edgeCreateManyData,
        });
      }

      return workflow;
    });

    await grantCreatorAccess(tenantID, "workflow", workflowCreationTransaction.workflowID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "workflowService:createWorkflow:success",
      params: {
        userID,
        workflowCreationTransaction,
      },
    });
    return workflowCreationTransaction;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:createWorkflow:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Update an existing workflow.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.workflowID
 * @param {string} param0.title
 * @param {JSON} param0.nodes
 * @param {JSON} param0.edges
 * @param {JSON} param0.workflowOptions
 * @returns {Promise<object>}
 */
workflowService.updateWorkflow = async ({ userID, tenantID, workflowID, title, nodes, edges, workflowOptions, authContext }) => {
  Logger.log("info", {
    message: "workflowService:updateWorkflow:params",
    params: {
      userID,
      tenantID,
      workflowID,
      title,
      nodes,
      edges,
      workflowOptions,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    const workflowUpdateTransaction = await prisma.$transaction(async (tx) => {
      // Update workflow title and options
      const updated = await tx.tblWorkflows.updateMany({
        where: { workflowID, tenantID },
        data: {
          title,
          workflowOptions: workflowOptions || {},
          updatedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new Error("Workflow not found or unauthorized");
      }

      const workflow = { workflowID, tenantID, title, workflowOptions };

      // Delete existing nodes and edges
      await tx.tblWorkflowNodes.deleteMany({
        where: { workflowID: workflowID },
      });
      await tx.tblWorkflowEdge.deleteMany({
        where: { workflowID: workflowID },
      });

      const { nodeCreateManyData, edgeCreateManyData } = buildWorkflowGraphPersistencePayload({
        workflowID: workflow.workflowID,
        nodes,
        edges,
      });

      // Create new nodes
      if (nodeCreateManyData.length > 0) {
        await tx.tblWorkflowNodes.createMany({
          data: nodeCreateManyData,
        });
      }

      // Create new edges
      if (edgeCreateManyData.length > 0) {
        await tx.tblWorkflowEdge.createMany({
          data: edgeCreateManyData,
        });
      }

      return workflow;
    });

    Logger.log("success", {
      message: "workflowService:updateWorkflow:success",
      params: {
        userID,
        workflowUpdateTransaction,
      },
    });
    return workflowUpdateTransaction;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:updateWorkflow:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Delete a workflow.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.workflowID
 * @returns {Promise<void>}
 */
workflowService.deleteWorkflow = async ({ userID, tenantID, workflowID, authContext }) => {
  Logger.log("info", {
    message: "workflowService:deleteWorkflow:params",
    params: {
      userID,
      tenantID,
      workflowID,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      // Delete nodes and edges first (foreign key constraints)
      await tx.tblWorkflowNodes.deleteMany({
        where: { workflowID: workflowID },
      });
      await tx.tblWorkflowEdge.deleteMany({
        where: { workflowID: workflowID },
      });
      // Delete workflow instances and logs if any
      await tx.tblWorkflowInstanceLogs.deleteMany({
        where: {
          tblWorkflowInstances: {
            workflowID: workflowID,
          },
        },
      });
      await tx.tblWorkflowInstances.deleteMany({
        where: { workflowID: workflowID },
      });
      // Delete the workflow
      const deleted = await tx.tblWorkflows.deleteMany({
        where: { workflowID: workflowID, tenantID: tenantID },
      });
      if (deleted.count === 0) {
        throw new Error("Workflow not found or unauthorized");
      }
    });

    await removePoliciesForResource(tenantID, `workflow:${workflowID}`);

    Logger.log("success", {
      message: "workflowService:deleteWorkflow:success",
      params: {
        userID,
        workflowID,
      },
    });
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:deleteWorkflow:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Clone a workflow.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.workflowID
 * @returns {Promise<object>}
 */
workflowService.cloneWorkflow = async ({ userID, tenantID, workflowID, authContext }) => {
  Logger.log("info", {
    message: "workflowService:cloneWorkflow:params",
    params: {
      userID,
      tenantID,
      workflowID,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    const existing = await prisma.tblWorkflows.findFirst({
      where: { workflowID, tenantID },
      include: {
        tblWorkflowNodes: true,
        tblWorkflowEdge: true,
      },
    });

    if (!existing) {
      throw new Error("Workflow not found");
    }

    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const crypto = require('crypto');

    const workflowCloneTransaction = await prisma.$transaction(async (tx) => {
      const workflow = await tx.tblWorkflows.create({
        data: {
          tenantID: tenantID,
          title: existing.title + " (Copy)",
          creatorID: finalCreatorID,
          createdByApiKeyID,
          workflowOptions: existing.workflowOptions || {},
        },
      });

      const nodeMap = {};
      const nodeCreateManyData = existing.tblWorkflowNodes.map((node) => {
        const newNodeID = crypto.randomUUID();
        nodeMap[node.nodeID] = newNodeID;
        return {
          nodeID: newNodeID,
          workflowID: workflow.workflowID,
          nodeType: node.nodeType,
          timeoutSeconds: node.timeoutSeconds,
          retryLimit: node.retryLimit,
          nodeConfig: node.nodeConfig,
        };
      });

      const edgeCreateManyData = existing.tblWorkflowEdge.map((edge) => {
        return {
          workflowID: workflow.workflowID,
          upstreamNodeID: nodeMap[edge.upstreamNodeID],
          downstreamNodeID: nodeMap[edge.downstreamNodeID],
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          edgeType: edge.edgeType,
          edgeConfig: edge.edgeConfig,
        };
      });

      if (nodeCreateManyData.length > 0) {
        await tx.tblWorkflowNodes.createMany({
          data: nodeCreateManyData,
        });
      }

      if (edgeCreateManyData.length > 0) {
        await tx.tblWorkflowEdge.createMany({
          data: edgeCreateManyData,
        });
      }

      return workflow;
    });

    await grantCreatorAccess(tenantID, "workflow", workflowCloneTransaction.workflowID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "workflowService:cloneWorkflow:success",
      params: {
        userID,
        workflowID,
        newWorkflowID: workflowCloneTransaction.workflowID,
      },
    });
    return workflowCloneTransaction;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:cloneWorkflow:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Execute a workflow asynchronously.
 * Returns instanceID immediately - actual execution happens in queue.
 * @param {object} param0
 * @param {string} param0.workflowID
 * @param {string} param0.tenantID
 * @param {object} param0.inputValues - Input parameters for workflow
 * @returns {Promise<{instanceID: string}>}
 */


/**
 * Get the status and logs of a workflow run.
 * Reads from the unified append-only instance log (tblWorkflowInstanceLogs).
 * @param {string} instanceID
 * @returns {Promise<object>}
 */
workflowService.getRunStatus = async (instanceID) => {
  Logger.log("info", {
    message: "workflowService:getRunStatus:params",
    params: { instanceID },
  });
  try {
    const { stateManager: sm } = require("./workflowEngine/stateManager");
    const instance = await sm.getInstanceWithLogs(instanceID);

    Logger.log("info", {
      message: "workflowService:getRunStatus:result",
      params: { instanceID, found: !!instance },
    });

    if (!instance) {
      return null;
    }

    const { tblWorkflows, ...instanceData } = instance;
    // Newest last for chronological display
    const logs = (instance.tblWorkflowInstanceLogs || []).map((log) => ({
      logID: log.logID,
      nodeID: log.nodeID,
      eventType: log.eventType,
      nodeStatus: log.nodeStatus,
      outputVariable: log.outputVariable,
      payload: log.payload,
      errorMessage: log.errorMessage,
      nodeAttempt: log.nodeAttempt,
      createdAt: log.createdAt,
    }));

    // Assemble context from unified log and strip internal keys
    const fullContext = await sm.assembleContext(instanceID);
    const contextData = Object.fromEntries(
      Object.entries(fullContext).filter(([key]) => !key.startsWith('__'))
    );

    return {
      instanceID: instanceData.instanceID,
      workflowID: instanceData.workflowID,
      workflowTitle: tblWorkflows?.title,
      status: instanceData.status,
      isTest: instanceData.isTest,
      parentInstanceID: instanceData.parentInstanceID ?? null,
      parentNodeID: instanceData.parentNodeID ?? null,
      startedAt: instanceData.startedAt,
      completedAt: instanceData.completedAt,
      contextData,
      logs,
    };
  }
  catch (error) {
    Logger.log("error", {
      message: "workflowService:getRunStatus:failure",
      params: { instanceID, error: error.message },
    });
    throw error;
  }
};

/**
 * List workflow run history for a tenant, optionally scoped to one workflow.
 *
 * @param {object} param0
 * @param {string} param0.tenantID
 * @param {string} [param0.workflowID]  - Only runs of this workflow
 * @param {string} [param0.status]      - Filter by run status
 * @param {number} [param0.page=1]
 * @param {number} [param0.pageSize=50]
 * @returns {Promise<{instances: Array, totalCount: number, page: number, pageSize: number}>}
 */
workflowService.listInstances = async ({
  tenantID,
  workflowID,
  status,
  isTest,
  parentInstanceID,
  page = 1,
  pageSize = 50,
}) => {
  try {
    const where = {
      tenantID,
      ...(workflowID ? { workflowID } : {}),
      ...(status ? { status } : {}),
      ...(typeof isTest === "boolean" ? { isTest } : {}),
      ...(parentInstanceID ? { parentInstanceID } : {}),
    };

    const skip = (page - 1) * pageSize;

    const [instances, totalCount] = await prisma.$transaction([
      prisma.tblWorkflowInstances.findMany({
        where,
        include: {
          tblWorkflows: { select: { title: true } },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.tblWorkflowInstances.count({ where }),
    ]);

    return {
      instances: instances.map((instance) => ({
        instanceID: instance.instanceID,
        workflowID: instance.workflowID,
        workflowTitle: instance.tblWorkflows?.title ?? null,
        status: instance.status,
        isTest: instance.isTest,
        parentInstanceID: instance.parentInstanceID ?? null,
        parentNodeID: instance.parentNodeID ?? null,
        startedAt: instance.startedAt,
        completedAt: instance.completedAt,
      })),
      totalCount,
      page,
      pageSize,
    };
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:listInstances:failure",
      params: { tenantID, workflowID, error: error.message },
    });
    throw error;
  }
};

/**
 * Test run a workflow without saving it.
 * Uses in-memory nodes/edges directly.
 * @param {object} param0
 * @param {string} param0.tenantID
 * @param {Array} param0.nodes - In-memory nodes from frontend
 * @param {Array} param0.edges - In-memory edges from frontend
 * @param {object} param0.inputValues - Input parameters for workflow
 * @returns {Promise<{instanceID: string, isTest: boolean}>}
 */
workflowService.testWorkflow = async ({ tenantID, nodes, edges, inputValues = {}, workflowOptions = {}, sourceWorkflowID }) => {
  const { startTestWorkflowTemporal: startTestWorkflow } = require("./temporal/service");

  Logger.log("info", {
    message: "workflowService:testWorkflow:params",
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length, sourceWorkflowID },
  });

  try {
    // Attribute test runs launched from a saved workflow editor so they show
    // up in that workflow's run history (still stored as isTest runs).
    if (sourceWorkflowID) {
      const source = await prisma.tblWorkflows.findFirst({
        where: { workflowID: sourceWorkflowID, tenantID },
        select: { workflowID: true },
      });
      if (!source) {
        throw new Error("Source workflow not found");
      }
    }
    const result = await startTestWorkflow({ nodes, edges, tenantID, inputValues, workflowOptions, sourceWorkflowID });

    Logger.log("success", {
      message: "workflowService:testWorkflow:started",
      params: { instanceID: result.instanceID },
    });

    return result;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:testWorkflow:failure",
      params: { error: error.message },
    });
    throw error;
  }
};

/**
 * Stop and delete a test workflow instance.
 * Removes the instance and all related logs from the database.
 * @param {object} param0
 * @param {string} param0.instanceID - The test instance ID to stop and delete
 * @returns {Promise<{success: boolean}>}
 */
workflowService.stopTestWorkflow = async ({ instanceID }) => {
  const { stateManager } = require("./workflowEngine/stateManager");

  Logger.log("info", {
    message: "workflowService:stopTestWorkflow:params",
    params: { instanceID },
  });

  try {
    const { terminateWorkflow } = require("./temporal/service");
    await terminateWorkflow({ instanceID, reason: 'stopTestWorkflow' }).catch(() => { });
    await stateManager.deleteTestInstance(instanceID);

    Logger.log("success", {
      message: "workflowService:stopTestWorkflow:deleted",
      params: { instanceID },
    });

    return { success: true };
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:stopTestWorkflow:failure",
      params: { error: error.message },
    });
    throw error;
  }
};

/**
 * Get the status of a workflow run for widget display.
 * Returns raw context data — the frontend handles all template resolution
 * and data transformation via evaluationEngine + widgets-logic builders.
 * 
 * @param {object} params
 * @param {string} params.instanceID - Workflow instance ID
 * @returns {Promise<object>} Workflow status with raw context data
 */
workflowService.getRunStatusForWidget = async ({ instanceID }) => {
  Logger.log("info", {
    message: "workflowService:getRunStatusForWidget:params",
    params: { instanceID },
  });

  try {
    // Get base run status (includes raw contextData)
    const runStatus = await workflowService.getRunStatus(instanceID);

    if (!runStatus) {
      return null;
    }

    return runStatus;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:getRunStatusForWidget:failure",
      params: { instanceID, error: error.message },
    });
    throw error;
  }
};

// ─── Schema Introspection ────────────────────────────────────────────────────

/** @type {Record<string, object>|null} — in-process singleton */
let _workflowNodeSchemas = null;

async function loadWorkflowNodeSchemas() {
  if (_workflowNodeSchemas) return _workflowNodeSchemas;
  const mod = await import('@jet-admin/workflow-nodes');
  _workflowNodeSchemas = mod.WORKFLOW_NODE_SCHEMAS;
  return _workflowNodeSchemas;
}

/**
 * Returns workflow node schemas, keyed by nodeType value.
 * If nodeType is supplied, returns only the schema for that type.
 *
 * @param {object} param0
 * @param {string|undefined} param0.nodeType
 * @returns {Promise<Record<string, object>|object>}
 */
workflowService.getWorkflowNodeSchemas = async ({ nodeType } = {}) => {
  Logger.log('info', {
    message: 'workflowService:getWorkflowNodeSchemas:params',
    params: { nodeType },
  });

  const all = await loadWorkflowNodeSchemas();

  if (nodeType) {
    const schema = all[nodeType];
    if (!schema) {
      throw Object.assign(new Error(`No schema found for workflow nodeType: '${nodeType}'`), { code: 'SCHEMA_NOT_FOUND' });
    }
    return { [nodeType]: schema };
  }

  return all;
};

module.exports = { 
  workflowService,
  // Exported for testing
  buildWorkflowGraphPersistencePayload,
};


