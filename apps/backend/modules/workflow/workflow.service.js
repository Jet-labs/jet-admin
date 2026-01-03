/**
 * WorkflowService
 * Business logic for Workflow management.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { startWorkflow } = require("./orchestrator/orchestrator");
const {
  formatAuthContextForLog,
  getCreationContextFromAuthContext,
} = require("../../utils/auth.context.utils");

const workflowService = {}

/**
 * Fetch all workflows for a tenant.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
workflowService.getAllWorkflows = async ({ userID, tenantID, authContext }) => {
  Logger.log("info", {
    message: "workflowService:getAllWorkflows:params",
    params: {
      userID,
      tenantID,
      ...formatAuthContextForLog(authContext),
    },
  });

  try {
    const workflows = await prisma.tblWorkflows.findMany({
      where: {
        tenantID: tenantID,
      },
    });
    Logger.log("success", {
      message: "workflowService:getAllWorkflows:success",
      params: {
        userID,
        workflows,
      },
    });
    return workflows;
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
  const workflow = await prisma.tblWorkflows.findUnique({
    where: { workflowID },
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
    const workflowCreationTransaction = await prisma.$transaction(async (tx) => {
      const workflow = await tx.tblWorkflows.create({
        data: {
          tenantID: tenantID,
          title,
          creatorID,
          createdByApiKeyID,
          workflowOptions: workflowOptions || {},
        },
      });
      await tx.tblWorkflowNodes.createMany({
        data: nodes.map((node) => ({
          nodeID: node.id, // Use frontend node ID
          workflowID: workflow.workflowID,
          nodeType: node.type,
          nodeConfig: {
            ...node.data,
            position: node.position,
            width: node.width,
            height: node.height,
            measured: node.measured,
          },
        })),
      });
      await tx.tblWorkflowEdge.createMany({
        data: edges.map((edge) => ({
          workflowID: workflow.workflowID,
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
        })),
      });
      return workflow;
    });

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
      const workflow = await tx.tblWorkflows.update({
        where: { workflowID: workflowID },
        data: {
          title,
          workflowOptions: workflowOptions || {},
          updatedAt: new Date(),
        },
      });

      // Delete existing nodes and edges
      await tx.tblWorkflowNodes.deleteMany({
        where: { workflowID: workflowID },
      });
      await tx.tblWorkflowEdge.deleteMany({
        where: { workflowID: workflowID },
      });

      // Create new nodes
      if (nodes && nodes.length > 0) {
        await tx.tblWorkflowNodes.createMany({
          data: nodes.map((node) => ({
            nodeID: node.id,
            workflowID: workflow.workflowID,
            nodeType: node.type,
            nodeConfig: {
              ...node.data,
              position: node.position,
              width: node.width,
              height: node.height,
              measured: node.measured,
            },
          })),
        });
      }

      // Create new edges
      if (edges && edges.length > 0) {
        await tx.tblWorkflowEdge.createMany({
          data: edges.map((edge) => ({
            workflowID: workflow.workflowID,
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
          })),
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
      await tx.tblNodeExecutionLogs.deleteMany({
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
      await tx.tblWorkflows.delete({
        where: { workflowID: workflowID },
      });
    });

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
 * Execute a workflow asynchronously.
 * Returns instanceID immediately - actual execution happens in queue.
 * @param {object} param0
 * @param {string} param0.workflowID
 * @param {string} param0.tenantID
 * @param {object} param0.inputParams - Input parameters for workflow
 * @returns {Promise<{instanceID: string}>}
 */
workflowService.executeWorkflow = async ({ workflowID, tenantID, inputParams = {} }) => {
  Logger.log("info", {
    message: "workflowService:executeWorkflow:params",
    params: { workflowID, tenantID, inputParams },
  });

  try {
    // Start workflow (async - returns immediately)
    const result = await startWorkflow({ workflowID, tenantID, inputParams });

    Logger.log("success", {
      message: "workflowService:executeWorkflow:started",
      params: { instanceID: result.instanceID },
    });

    return result;
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:executeWorkflow:failure",
      params: { workflowID, error: error.message },
    });
    throw error;
  }
};

/**
 * Get the status and logs of a workflow run.
 * @param {string} instanceID
 * @returns {Promise<object>}
 */
workflowService.getRunStatus = async (instanceID) => {
  Logger.log("info", {
    message: "workflowService:getRunStatus:params",
    params: { instanceID },
  });
  try {
    const instance = await prisma.tblWorkflowInstances.findUnique({
      where: { instanceID: instanceID },
      include: {
        tblNodeExecutionLogs: {
          orderBy: { createdAt: 'asc' },
        },
        tblWorkflows: {
          select: { title: true },
        },
      },
    });
    Logger.log("info", {
      message: "workflowService:getRunStatus:result",
      params: { instanceID, found: !!instance },
    });

    if (!instance) {
      return null;
    }

    // Convert BigInt executionLogID to string to avoid JSON serialization issues
    const logs = instance.tblNodeExecutionLogs.map(log => ({
      ...log,
      executionLogID: log.executionLogID.toString(),
    }));

    return {
      instanceID: instance.instanceID,
      workflowID: instance.workflowID,
      workflowTitle: instance.tblWorkflows?.title,
      status: instance.status,
      contextData: instance.contextData,
      startedAt: instance.startedAt,
      completedAt: instance.completedAt,
      logs: logs,
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
 * Test run a workflow without saving it.
 * Uses in-memory nodes/edges directly.
 * @param {object} param0
 * @param {string} param0.tenantID
 * @param {Array} param0.nodes - In-memory nodes from frontend
 * @param {Array} param0.edges - In-memory edges from frontend
 * @param {object} param0.inputParams - Input parameters for workflow
 * @returns {Promise<{instanceID: string, isTest: boolean}>}
 */
workflowService.testWorkflow = async ({ tenantID, nodes, edges, inputParams = {} }) => {
  const { startTestWorkflow } = require("./orchestrator/orchestrator");

  Logger.log("info", {
    message: "workflowService:testWorkflow:params",
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length },
  });

  try {
    const result = await startTestWorkflow({ nodes, edges, tenantID, inputParams });

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

module.exports = { workflowService };


