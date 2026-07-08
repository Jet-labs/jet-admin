/**
 * Listener Controller
 * Express request handlers for the listener API.
 */
const { listenerService } = require('./listener.service');
const Logger = require('../../utils/logger');
const constants = require("../../constants");
const { expressUtils } = require('../../utils/express.utils');
const { getServiceAuthContext } = require('../../utils/auth.context.utils');

const listenerController = {
  // ─── Listeners ──────────────────────────────────────────────────────────

  async getAllListeners(req, res) {
    try {
      const { user } = req;
      const { tenantID } = req.params;
      const { search, page, pageSize } = req.query;
      const authContext = getServiceAuthContext(req);

      Logger.log("info", {
        message: "listenerController:getAllListeners:params",
        params: { userID: user.userID, tenantID, search, page, pageSize, authContext },
      });

      const result = await listenerService.getAllListeners({
        tenantID,
        search,
        page,
        pageSize,
      });

      Logger.log("success", {
        message: "listenerController:getAllListeners:success",
        params: { listenersCount: result.listeners.length },
      });

      return expressUtils.sendResponse(res, true, {
        listeners: result.listeners,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        page: result.page,
        pageSize: result.pageSize,
        message: "Listeners fetched successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:getAllListeners:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async getListenerByID(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;

      Logger.log("info", {
        message: "listenerController:getListenerByID:params",
        params: { userID: user.userID, tenantID, listenerID },
      });

      const listener = await listenerService.getListenerByID({ tenantID, listenerID });
      if (!listener) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:getListenerByID:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener fetched successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:getListenerByID:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async createListener(req, res) {
    try {
      const { user } = req;
      const { tenantID } = req.params;
      const authContext = getServiceAuthContext(req);
      const data = req.body;

      Logger.log("info", {
        message: "listenerController:createListener:params",
        params: { userID: user.userID, tenantID, authContext, data },
      });

      const listener = await listenerService.createListener({ tenantID, userID: user.userID, data, authContext });

      Logger.log("success", {
        message: "listenerController:createListener:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener created successfully.",
      }, null, constants.HTTP_STATUS.CREATED);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:createListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async updateListener(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;
      const data = req.body;

      Logger.log("info", {
        message: "listenerController:updateListener:params",
        params: { userID: user.userID, tenantID, listenerID, data },
      });

      const listener = await listenerService.updateListener({ tenantID, listenerID, data });
      if (!listener) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:updateListener:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener updated successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:updateListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async deleteListener(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;

      Logger.log("info", {
        message: "listenerController:deleteListener:params",
        params: { userID: user.userID, tenantID, listenerID },
      });

      const result = await listenerService.deleteListener({ tenantID, listenerID });
      if (!result) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:deleteListener:success",
        params: { result },
      });

      return expressUtils.sendResponse(res, true, {
        message: "Listener deleted successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:deleteListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async cloneListener(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;

      const authContext = getServiceAuthContext(req);
      Logger.log("info", {
        message: "listenerController:cloneListener:params",
        params: { userID: user.userID, tenantID, listenerID, authContext },
      });

      const listener = await listenerService.cloneListener({ tenantID, listenerID, userID: user.userID, authContext });

      Logger.log("success", {
        message: "listenerController:cloneListener:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener cloned successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:cloneListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  async activateListener(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;

      Logger.log("info", {
        message: "listenerController:activateListener:params",
        params: { userID: user.userID, tenantID, listenerID },
      });

      const listener = await listenerService.activateListener({ tenantID, listenerID });
      if (!listener) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:activateListener:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener activated successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:activateListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async deactivateListener(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;

      Logger.log("info", {
        message: "listenerController:deactivateListener:params",
        params: { userID: user.userID, tenantID, listenerID },
      });

      const listener = await listenerService.deactivateListener({ tenantID, listenerID });
      if (!listener) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:deactivateListener:success",
        params: { listener },
      });

      return expressUtils.sendResponse(res, true, {
        listener,
        message: "Listener deactivated successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:deactivateListener:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  // ─── Actions ────────────────────────────────────────────────────────────

  async addAction(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID } = req.params;
      const data = req.body;

      Logger.log("info", {
        message: "listenerController:addAction:params",
        params: { userID: user.userID, tenantID, listenerID, data },
      });

      const action = await listenerService.addAction({ tenantID, listenerID, data });
      if (!action) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:addAction:success",
        params: { action },
      });

      return expressUtils.sendResponse(res, true, {
        action,
        message: "Listener action added successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:addAction:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async updateAction(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID, actionID } = req.params;
      const data = req.body;

      Logger.log("info", {
        message: "listenerController:updateAction:params",
        params: { userID: user.userID, tenantID, listenerID, actionID, data },
      });

      const action = await listenerService.updateAction({ tenantID, listenerID, actionID, data });
      if (!action) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:updateAction:success",
        params: { action },
      });

      return expressUtils.sendResponse(res, true, {
        action,
        message: "Listener action updated successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:updateAction:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  async deleteAction(req, res) {
    try {
      const { user } = req;
      const { tenantID, listenerID, actionID } = req.params;

      Logger.log("info", {
        message: "listenerController:deleteAction:params",
        params: { userID: user.userID, tenantID, listenerID, actionID },
      });

      const result = await listenerService.deleteAction({ tenantID, listenerID, actionID });
      if (!result) {
        return expressUtils.sendResponse(res, false, {}, new Error('Listener not found', constants.HTTP_STATUS.BAD_REQUEST));
      }

      Logger.log("success", {
        message: "listenerController:deleteAction:success",
        params: { result },
      });

      return expressUtils.sendResponse(res, true, {
        message: "Listener action deleted successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:deleteAction:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },

  // ─── Status ─────────────────────────────────────────────────────────────

  async getConnectionStatus(req, res) {
    try {
      const status = listenerService.getConnectionStatus();
      
      Logger.log("success", {
        message: "listenerController:getConnectionStatus:success",
        params: { status },
      });

      return expressUtils.sendResponse(res, true, {
        status,
        message: "Connection status fetched successfully.",
      }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log("error", {
        message: "listenerController:getConnectionStatus:error",
        params: { error },
      });
      return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
    }
  },
  /**
   * GET /listeners/schemas?datasourceType=...
   * Returns listener config schemas for one or all datasource types.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async getListenerSchemas(req, res) {
    try {
      const { user } = req;
      const { tenantID } = req.params;
      const { datasourceType } = req.query;

      Logger.log('info', {
        message: 'listenerController:getListenerSchemas:params',
        params: { userID: user.userID, tenantID, datasourceType },
      });

      const schemas = await listenerService.getListenerSchemas({ datasourceType });

      Logger.log('success', {
        message: 'listenerController:getListenerSchemas:success',
        params: { userID: user.userID, tenantID, schemaCount: Object.keys(schemas).length },
      });

      return expressUtils.sendResponse(res, true, { schemas, message: 'Listener schemas fetched successfully.' }, null, constants.HTTP_STATUS.OK);
    } catch (error) {
      Logger.log('error', {
        message: 'listenerController:getListenerSchemas:error',
        params: { error },
      });
      const status = error.code === 'SCHEMA_NOT_FOUND' ? constants.HTTP_STATUS.NOT_FOUND : constants.HTTP_STATUS.BAD_REQUEST;
      return expressUtils.sendResponse(res, false, {}, error, status);
    }
  },
};

module.exports = listenerController;
