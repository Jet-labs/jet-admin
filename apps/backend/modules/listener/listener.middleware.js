const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");

const listenerMiddleware = {};

/**
 * Middleware to extract workflow and dataquery pipeline action dependencies
 * for verification against the user's Casbin policies.
 */
listenerMiddleware.extractListenerPipelinePermissions = (req, res, next) => {
  try {
    const workflowIDs = new Set();
    const dataQueryIDs = new Set();

    const parseAction = (action) => {
      if (!action) return;
      if (action.actionType === 'trigger_workflow' && action.actionConfig?.workflowID) {
        workflowIDs.add(action.actionConfig.workflowID);
      }
      if (action.actionType === 'trigger_query' && action.actionConfig?.dataQueryID) {
        dataQueryIDs.add(action.actionConfig.dataQueryID);
      }
      // Also handle flat mapping if client sends them directly:
      if (action.workflowID) workflowIDs.add(action.workflowID);
      if (action.dataQueryID) dataQueryIDs.add(action.dataQueryID);
      if (action.actionConfig?.workflowID) workflowIDs.add(action.actionConfig.workflowID);
      if (action.actionConfig?.dataQueryID) dataQueryIDs.add(action.actionConfig.dataQueryID);
    };

    // 1. Check direct req.body (for addAction or updateAction)
    parseAction(req.body);

    // 2. Check actions array in body (for createListener or updateListener)
    if (Array.isArray(req.body.actions)) {
      req.body.actions.forEach(parseAction);
    }

    // Set resolved IDs on request object
    if (workflowIDs.size > 0) req.workflowIDs = Array.from(workflowIDs);
    if (dataQueryIDs.size > 0) req.dataQueryIDs = Array.from(dataQueryIDs);

    next();
  } catch (error) {
    Logger.log("error", {
      message: "listenerMiddleware:extractListenerPipelinePermissions:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Middleware to resolve listener supporting assets (datasourceID, workflows, dataqueries)
 * from the database for the listener clone endpoint.
 */
listenerMiddleware.resolveListenerClonePermissionsFromDB = async (req, res, next) => {
  try {
    const { listenerID } = req.params;
    if (!listenerID) {
      return next();
    }
    const listener = await prisma.tblListeners.findUnique({
      where: { listenerID },
      include: {
        tblListenerActions: true
      }
    });

    if (listener) {
      if (listener.datasourceID) {
        req.datasourceID = listener.datasourceID;
      }
      
      const workflowIDs = new Set();
      const dataQueryIDs = new Set();

      if (Array.isArray(listener.tblListenerActions)) {
        for (const action of listener.tblListenerActions) {
          if (action.actionType === 'trigger_workflow' && action.actionConfig?.workflowID) {
            workflowIDs.add(action.actionConfig.workflowID);
          }
          if (action.actionType === 'trigger_query' && action.actionConfig?.dataQueryID) {
            dataQueryIDs.add(action.actionConfig.dataQueryID);
          }
          if (action.actionConfig?.workflowID) workflowIDs.add(action.actionConfig.workflowID);
          if (action.actionConfig?.dataQueryID) dataQueryIDs.add(action.actionConfig.dataQueryID);
        }
      }

      if (workflowIDs.size > 0) req.workflowIDs = Array.from(workflowIDs);
      if (dataQueryIDs.size > 0) req.dataQueryIDs = Array.from(dataQueryIDs);
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "resolveListenerClonePermissionsFromDB:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { listenerMiddleware };
