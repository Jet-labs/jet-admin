/**
 * WorkflowService
 * Business logic for Workflow management.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");

const workflowService = {}

/**
 * Fetch all workflows for a tenant.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
workflowService.getAllWorkflows = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "workflowService:getAllWorkflows:params",
    params: {
      userID,
      tenantID,
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
 * Create a new workflow.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.title
 * @param {JSON} param0.nodes
 * @param {JSON} param0.edges
 * @returns {Promise<object>}
 */
workflowService.createWorkflow = async ({ userID, tenantID, title, nodes, edges }) => {
  Logger.log("info", {
    message: "workflowService:createWorkflow:params",
    params: {
      userID,
      tenantID,
      title,
      nodes,
      edges,
    },
  });

  try {
    const workflowCreationTransaction = await prisma.$transaction(async (tx) => {
      const workflow = await tx.tblWorkflows.create({
        data: {
          tenantID: tenantID,
          title,
          creatorID: userID,
        },
      });
      await tx.tblWorkflowNodes.createMany({
        data: nodes.map((node) => ({
          workflowID: workflow.workflowID,
          nodeType: node.type,
          nodeConfig: node.data,
        })),
      });
      await tx.tblWorkflowEdge.createMany({
        data: edges.map((edge) => ({
          workflowID: workflow.workflowID,
          upstreamNodeID: edge.source,
          downstreamNodeID: edge.target,
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
module.exports = { workflowService };
