/**
 * WorkflowController
 * Handles API requests for workflow execution.
 */
const { workflowService } = require("./workflow.service");
const { authorizedExecuteWorkflow } = require("../../utils/authorizedProxy");

const Logger = require("../../utils/logger");
const constants = require("../../constants");
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
    const { search, page, pageSize } = req.query;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:getAllWorkflows:params", params: { userID: user.userID, tenantID, search, page, pageSize, authContext } });
    
    const result = await workflowService.getAllWorkflows({
      userID: user.userID,
      tenantID,
      search,
      page,
      pageSize,
      authContext
    });
    
    Logger.log("success", { message: "WorkflowController:getAllWorkflows:success", params: { workflowLength: result.workflows.length } });
    expressUtils.sendResponse(
      res,
      true,
      {
        workflows: result.workflows,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        page: result.page,
        pageSize: result.pageSize,
      }, null, constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getAllWorkflows:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    expressUtils.sendResponse(res, true, { workflow }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getWorkflowByID:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const { title, nodes = [], edges = [], workflowOptions } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:createWorkflow:params", params: { userID: user.userID, tenantID, title, nodes, edges, workflowOptions, authContext } });
    const workflow = await workflowService.createWorkflow({ userID: user.userID, tenantID, title, nodes, edges, workflowOptions, authContext });
    Logger.log("success", { message: "WorkflowController:createWorkflow:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:createWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const { title, nodes = [], edges = [], workflowOptions } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:updateWorkflow:params", params: { userID: user.userID, tenantID, workflowID, title, nodes, edges, workflowOptions, authContext } });
    const workflow = await workflowService.updateWorkflow({ userID: user.userID, tenantID, workflowID, title, nodes, edges, workflowOptions, authContext });
    Logger.log("success", { message: "WorkflowController:updateWorkflow:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:updateWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    expressUtils.sendResponse(res, true, { message: "Workflow deleted successfully." }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:deleteWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Clone a workflow.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.cloneWorkflow = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, workflowID } = req.params;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", { message: "WorkflowController:cloneWorkflow:params", params: { userID: user.userID, tenantID, workflowID, authContext } });
    const workflow = await workflowService.cloneWorkflow({ userID: user.userID, tenantID, workflowID, authContext });
    Logger.log("success", { message: "WorkflowController:cloneWorkflow:success", params: { workflow } });
    expressUtils.sendResponse(res, true, { workflow }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:cloneWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const inputValues = req.body.inputValues || {};
    const authContext = getServiceAuthContext(req);

    Logger.log("info", { message: "WorkflowController:executeWorkflow:params", params: { workflowID, tenantID, authContext } });

    const result = await authorizedExecuteWorkflow({ 
      workflowID, 
      tenantID, 
      inputValues, 
      executionCtx: req.executionCtx 
    });

    Logger.log("success", { message: "WorkflowController:executeWorkflow:success", params: { instanceID: result.instanceID } });
    expressUtils.sendResponse(res, true, result, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:executeWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
      return expressUtils.sendResponse(res, false, {}, { message: "Run not found" }, constants.HTTP_STATUS.NOT_FOUND, constants.HTTP_STATUS.BAD_REQUEST);
    }

    expressUtils.sendResponse(res, true, status, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getRunStatus:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Test run a workflow without saving.
 * Accepts nodes and edges directly in request body.
 */
workflowController.testWorkflow = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { nodes, edges } = req.body;
    const inputValues = req.body.inputValues || {};
    const authContext = getServiceAuthContext(req);

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return expressUtils.sendResponse(res, false, {}, { message: "nodes and edges are required" }, constants.HTTP_STATUS.BAD_REQUEST);
    }

    Logger.log("info", { message: "WorkflowController:testWorkflow:params", params: { tenantID, nodeCount: nodes.length, authContext } });

    const result = await workflowService.testWorkflow({ tenantID, nodes, edges, inputValues, authContext });

    Logger.log("success", { message: "WorkflowController:testWorkflow:success", params: { instanceID: result.instanceID } });
    expressUtils.sendResponse(res, true, result, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:testWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    expressUtils.sendResponse(res, true, result, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:stopTestWorkflow:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get the status of a workflow run with processed widget data.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
workflowController.getRunStatusForWidget = async (req, res) => {
  try {
    const { instanceID } = req.params;
    const { widgetType, datasetFields, parameters } = req.body;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "WorkflowController:getRunStatusForWidget:params",
      params: { instanceID, widgetType, authContext }
    });

    const status = await workflowService.getRunStatusForWidget({
      instanceID,
      widgetType,
      datasetFields,
      parameters
    });

    if (!status) {
      Logger.log("error", { message: "WorkflowController:getRunStatusForWidget:notFound", params: { instanceID } });
      return expressUtils.sendResponse(res, false, {}, { message: "Run not found" }, constants.HTTP_STATUS.NOT_FOUND, constants.HTTP_STATUS.BAD_REQUEST);
    }

    Logger.log("success", {
      message: "WorkflowController:getRunStatusForWidget:success",
      params: { instanceID, status: status.status, hasData: !!status.data }
    });
    expressUtils.sendResponse(res, true, status, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getRunStatusForWidget:error", params: { error: error.message } });
    expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { workflowController };

