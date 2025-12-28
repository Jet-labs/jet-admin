/**
 * WorkflowController
 * Handles API requests for workflow execution.
 */
const { workflowService } = require("./workflow.service");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");

const workflowController = {};

/**
 * Get all workflows for a tenant.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.getAllWorkflows = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", { message: "WorkflowController:getAllWorkflows:params", params: { userID: user.userID, tenantID } });
    const workflows = await workflowService.getAllWorkflows({ userID: user.userID, tenantID });
    Logger.log("success", { message: "WorkflowController:getAllWorkflows:success", params: { workflows } });
    expressUtils.sendResponse(res, true, { workflows });
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getAllWorkflows:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Get a workflow by ID.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.getWorkflowByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, workflowID } = req.params;
    Logger.log("info", { message: "WorkflowController:getWorkflowByID:params", params: { userID: user.userID, tenantID, workflowID } });
    const workflow = await workflowService.getWorkflowByID({ userID: user.userID, tenantID, workflowID });
    Logger.log("success", { message: "WorkflowController:getWorkflowByID:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow });
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getWorkflowByID:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Create a new workflow.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.createWorkflow = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { title, nodes, edges } = req.body;
    Logger.log("info", { message: "WorkflowController:createWorkflow:params", params: { userID: user.userID, tenantID, title, nodes, edges } });
    const workflow = await workflowService.createWorkflow({ userID: user.userID, tenantID, title, nodes, edges });
    Logger.log("success", { message: "WorkflowController:createWorkflow:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow });
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:createWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Update a workflow.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.updateWorkflow = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, workflowID } = req.params;
    const { title, nodes, edges } = req.body;
    Logger.log("info", { message: "WorkflowController:updateWorkflow:params", params: { userID: user.userID, tenantID, workflowID, title, nodes, edges } });
    const workflow = await workflowService.updateWorkflow({ userID: user.userID, tenantID, workflowID, title, nodes, edges });
    Logger.log("success", { message: "WorkflowController:updateWorkflow:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow });
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:updateWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Delete a workflow.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.deleteWorkflow = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, workflowID } = req.params;
    Logger.log("info", { message: "WorkflowController:deleteWorkflow:params", params: { userID: user.userID, tenantID, workflowID } });
    await workflowService.deleteWorkflow({ userID: user.userID, tenantID, workflowID });
    Logger.log("success", { message: "WorkflowController:deleteWorkflow:success", params: { workflowID } });
    expressUtils.sendResponse(res, true, { message: "Workflow deleted successfully." });
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:deleteWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Execute a workflow.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.executeWorkflow = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, workflowID } = req.params;
    const { inputParams = {} } = req.body;

    Logger.log("info", { message: "WorkflowController:executeWorkflow:params", params: { workflowID, tenantID } });

    const result = await workflowService.executeWorkflow({ workflowID, tenantID, inputParams });

    Logger.log("success", { message: "WorkflowController:executeWorkflow:success", params: { instanceID: result.instanceID } });
    expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:executeWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Get the status of a workflow run.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.getRunStatus = async (req, res) => {
  try {
    const { instanceID } = req.params;

    const status = await workflowService.getRunStatus(instanceID);

    if (!status) {
      return expressUtils.sendResponse(res, false, {}, { message: "Run not found" });
    }

    expressUtils.sendResponse(res, true, status);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getRunStatus:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Test run a workflow without saving.
 * Accepts nodes and edges directly in request body.
 */
workflowController.testWorkflow = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { nodes, edges, inputParams = {} } = req.body;

    if (!nodes || !edges) {
      return expressUtils.sendResponse(res, false, {}, { message: "nodes and edges are required" });
    }

    Logger.log("info", { message: "WorkflowController:testWorkflow:params", params: { tenantID, nodeCount: nodes.length } });

    const result = await workflowService.testWorkflow({ tenantID, nodes, edges, inputParams });

    Logger.log("success", { message: "WorkflowController:testWorkflow:success", params: { instanceID: result.instanceID } });
    expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:testWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { workflowController };

