/**
 * WorkflowController
 * Handles API requests for workflow execution.
 */
const { workflowService } = require("./workflow.service");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:getAllWorkflows:params", params: { userID: user.userID, tenantID, authContext } });
    const workflows = await workflowService.getAllWorkflows({ userID: user.userID, tenantID, authContext });
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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:getWorkflowByID:params", params: { userID: user.userID, tenantID, workflowID, authContext } });
    const workflow = await workflowService.getWorkflowByID({ userID: user.userID, tenantID, workflowID, authContext });
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
    const { title, nodes, edges, workflowOptions } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:createWorkflow:params", params: { userID: user.userID, tenantID, title, nodes, edges, workflowOptions, authContext } });
    const workflow = await workflowService.createWorkflow({ userID: user.userID, tenantID, title, nodes, edges, workflowOptions, authContext });
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
    const { title, nodes, edges, workflowOptions } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:updateWorkflow:params", params: { userID: user.userID, tenantID, workflowID, title, nodes, edges, workflowOptions, authContext } });
    const workflow = await workflowService.updateWorkflow({ userID: user.userID, tenantID, workflowID, title, nodes, edges, workflowOptions, authContext });
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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:deleteWorkflow:params", params: { userID: user.userID, tenantID, workflowID, authContext } });
    await workflowService.deleteWorkflow({ userID: user.userID, tenantID, workflowID, authContext });
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
    const authContext = getServiceAuthContext(req);

    Logger.log("info", { message: "WorkflowController:executeWorkflow:params", params: { workflowID, tenantID, authContext } });

    const result = await workflowService.executeWorkflow({ workflowID, tenantID, inputParams, authContext });

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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:getRunStatus:params", params: { instanceID, authContext } });

    const status = await workflowService.getRunStatus(instanceID, authContext);

    if (!status) {
      Logger.log("error", { message: "WorkflowController:getRunStatus:notFound", params: { instanceID } });
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
    const authContext = getServiceAuthContext(req);

    if (!nodes || !edges) {
      return expressUtils.sendResponse(res, false, {}, { message: "nodes and edges are required" });
    }

    Logger.log("info", { message: "WorkflowController:testWorkflow:params", params: { tenantID, nodeCount: nodes.length, authContext } });

    const result = await workflowService.testWorkflow({ tenantID, nodes, edges, inputParams, authContext });

    Logger.log("success", { message: "WorkflowController:testWorkflow:success", params: { instanceID: result.instanceID } });
    expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:testWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Stop and delete a test workflow instance.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.stopTestWorkflow = async (req, res) => {
  try {
    const { instanceID } = req.params;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", { message: "WorkflowController:stopTestWorkflow:params", params: { instanceID, authContext } });

    const result = await workflowService.stopTestWorkflow({ instanceID });

    Logger.log("success", { message: "WorkflowController:stopTestWorkflow:success", params: { instanceID } });
    expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:stopTestWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { workflowController };

