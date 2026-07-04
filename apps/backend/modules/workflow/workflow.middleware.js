const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");

const workflowMiddleware = {};

/**
 * Middleware to resolve workflowID from instanceID in request parameters
 * and attach it to req.workflowID for down-stream authorize middleware using reqKey.
 */
workflowMiddleware.resolveWorkflowIDFromInstance = async (req, res, next) => {
  try {
    const { instanceID } = req.params;
    if (!instanceID) {
      return next();
    }
    const instance = await prisma.tblWorkflowInstances.findUnique({
      where: { instanceID },
      select: { workflowID: true }
    });
    if (instance) {
      req.workflowID = instance.workflowID || "*";
    } else {
      req.workflowID = "*";
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "workflowMiddleware:resolveWorkflowIDFromInstance:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Middleware to resolve workflowID from collectionRequestID in request parameters
 * and attach it to req.workflowID for down-stream authorize middleware using reqKey.
 */
workflowMiddleware.resolveWorkflowIDFromCollectionRequest = async (req, res, next) => {
  try {
    const { collectionRequestID } = req.params;
    if (!collectionRequestID) {
      return next();
    }
    const request = await prisma.tblWorkflowDataCollectionRequests.findUnique({
      where: { collectionRequestID },
      include: {
        tblWorkflowInstances: {
          select: { workflowID: true }
        }
      }
    });
    if (request && request.tblWorkflowInstances) {
      req.workflowID = request.tblWorkflowInstances.workflowID || "*";
    } else {
      req.workflowID = "*";
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "workflowMiddleware:resolveWorkflowIDFromCollectionRequest:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Middleware to extract dataQueryIDs from workflow nodes for auth verification.
 */
workflowMiddleware.extractWorkflowDataQueryIDs = async (req, res, next) => {
  try {
    const dataQueryIDs = new Set();
    
    // Check nodes in body
    if (Array.isArray(req.body.nodes)) {
      for (const node of req.body.nodes) {
        const nodeType = node?.type ?? node?.nodeType;
        if (nodeType === "dataQuery") {
          const nodeData = node?.data ?? node?.nodeConfig ?? {};
          const qid = nodeData?.dataQueryID;
          if (qid) {
            dataQueryIDs.add(qid);
          }
        }
      }
    }

    if (dataQueryIDs.size > 0) {
      req.dataQueryIDs = Array.from(dataQueryIDs);
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "workflowMiddleware:extractWorkflowDataQueryIDs:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Middleware to extract dataQueryIDs from an existing workflow in the DB (for clone check)
 */
workflowMiddleware.resolveWorkflowDataQueryIDsFromDB = async (req, res, next) => {
  try {
    const { workflowID } = req.params;
    if (!workflowID) {
      return next();
    }
    const workflow = await prisma.tblWorkflows.findUnique({
      where: { workflowID },
      include: {
        tblWorkflowNodes: true
      }
    });

    if (workflow && Array.isArray(workflow.tblWorkflowNodes)) {
      const dataQueryIDs = new Set();
      for (const node of workflow.tblWorkflowNodes) {
        const nodeType = node?.nodeType;
        if (nodeType === "dataQuery") {
          const nodeData = node?.nodeConfig ?? {};
          const qid = nodeData?.dataQueryID;
          if (qid) {
            dataQueryIDs.add(qid);
          }
        }
      }
      if (dataQueryIDs.size > 0) {
        req.dataQueryIDs = Array.from(dataQueryIDs);
      }
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "workflowMiddleware:resolveWorkflowDataQueryIDsFromDB:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { workflowMiddleware };

