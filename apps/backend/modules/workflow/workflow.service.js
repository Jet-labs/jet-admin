/**
 * WorkflowService
 * Business logic for Workflow management.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { startWorkflow } = require("./workflowEngine/engine");
const {
  formatAuthContextForLog,
  getCreationContextFromAuthContext,
} = require("../../utils/auth.context.utils");
const { processWorkflowDataForWidget } = require("@jet-admin/widgets-logic");
const { resolveTemplate } = require("../../utils/templateEngine/resolver");
const { resolveInputs } = require("../../utils/inputArgs.util");
const { extractWorkflowDefinitions } = require("../../utils/definitionProvider.util");

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
      include: {
        tblWorkflowNodes: true,
        tblWorkflowEdge: true,
      },
    });
    Logger.log("success", {
      message: "workflowService:getAllWorkflows:success",
      params: {
        userID,
        workflowLength: workflows?.length,
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
 * @param {object} param0.inputArgs - Input parameters for workflow
 * @returns {Promise<{instanceID: string}>}
 */
workflowService.executeWorkflow = async ({ workflowID, tenantID, inputArgs = {} }) => {
  Logger.log("info", {
    message: "workflowService:executeWorkflow:params",
    params: { workflowID, tenantID, inputArgs },
  });

  try {
    // Resolve & validate inputs through the unified pipeline
    const workflow = await prisma.tblWorkflows.findUnique({ where: { workflowID } });
    const definitions = workflow ? extractWorkflowDefinitions(workflow) : [];
    const { resolved, errors, valid } = await resolveInputs({
      type: 'workflow',
      definitions,
      runtimeValues: inputArgs,
    });

    if (!valid) {
      Logger.log("error", {
        message: "workflowService:executeWorkflow:inputValidationFailed",
        params: { workflowID, errors },
      });
      throw new Error(`Workflow input validation failed: ${JSON.stringify(errors)}`);
    }

    // Start workflow with resolved inputs
    const result = await startWorkflow({ workflowID, tenantID, inputArgs: resolved });

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

    // Assemble context from unified log and strip internal keys
    const { stateManager: sm } = require("./workflowEngine/stateManager");
    const fullContext = await sm.assembleContext(instanceID);
    const contextData = Object.fromEntries(
      Object.entries(fullContext).filter(([key]) => !key.startsWith('__'))
    );

    return {
      instanceID: instance.instanceID,
      workflowID: instance.workflowID,
      workflowTitle: instance.tblWorkflows?.title,
      status: instance.status,
      contextData,
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
 * @param {object} param0.inputArgs - Input parameters for workflow
 * @returns {Promise<{instanceID: string, isTest: boolean}>}
 */
workflowService.testWorkflow = async ({ tenantID, nodes, edges, inputArgs = {} }) => {
  const { startTestWorkflow } = require("./workflowEngine/engine");

  Logger.log("info", {
    message: "workflowService:testWorkflow:params",
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length },
  });

  try {
    const result = await startTestWorkflow({ nodes, edges, tenantID, inputArgs });

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
 * Get the status of a workflow run and process context data for widget display.
 * Widget-type-agnostic: accepts widgetConfig as opaque blob, delegates to widgets-logic.
 * 
 * @param {object} params
 * @param {string} params.instanceID - Workflow instance ID
 * @param {string} params.widgetType - Widget type ('vega-lite', 'vega', or future types)
 * @param {object} params.workflowConfig - Workflow binding config
 * @param {object} params.widgetConfig - Opaque widget config blob (templates not yet resolved)
 * @returns {Promise<object>} Workflow status with processed data
 */
workflowService.getRunStatusForWidget = async ({ instanceID, widgetType, workflowConfig, widgetConfig }) => {
  Logger.log("info", {
    message: "workflowService:getRunStatusForWidget:params",
    params: { instanceID, widgetType },
  });

  try {
    // Get base run status
    const runStatus = await workflowService.getRunStatus(instanceID);

    if (!runStatus) {
      return null;
    }

    // If not completed, return status as-is
    if (runStatus.status !== 'COMPLETED') {
      return runStatus;
    }

    if (!widgetConfig) {
      Logger.log("info", {
        message: "workflowService:getRunStatusForWidget:noWidgetConfig",
        params: { instanceID },
      });
      return runStatus;
    }

    // Resolve templates in widgetConfig generically
    const resolvedWidgetConfig = resolveTemplate(widgetConfig, { ctx: runStatus.contextData }, {
      preserveSingleExpressionType: true,
    });

    // Delegate to widgets-logic for final spec shape
    const processedData = processWorkflowDataForWidget({
      widgetType: widgetType || 'vega-lite',
      widgetConfig: resolvedWidgetConfig,
    });

    Logger.log("success", {
      message: "workflowService:getRunStatusForWidget:processed",
      params: { instanceID, widgetType, hasData: !!processedData },
    });

    return {
      ...runStatus,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message: "workflowService:getRunStatusForWidget:failure",
      params: { instanceID, error: error.message },
    });
    throw error;
  }
};

module.exports = { 
  workflowService,
  // Exported for testing
  buildWorkflowGraphPersistencePayload,
};


