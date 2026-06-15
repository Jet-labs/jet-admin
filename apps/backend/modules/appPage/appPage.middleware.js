const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");

const appPageMiddleware = {};

/**
 * Middleware to extract asset IDs (dataqueries, workflows, listeners, widgets)
 * from appPageConfig in the request body for create and update endpoints.
 */
appPageMiddleware.extractAppPageConfigAssetIDs = (req, res, next) => {
  try {
    const dataQueryIDs = new Set();
    const workflowIDs = new Set();
    const listenerIDs = new Set();
    const widgetIDs = new Set();

    const parseConfig = (config) => {
      if (!config) return;

      // 1. Extract from dataSources
      if (Array.isArray(config.dataSources)) {
        for (const ds of config.dataSources) {
          if (ds.type === "query" && ds.queryID) {
            dataQueryIDs.add(ds.queryID);
          } else if (ds.type === "workflow" && ds.workflowID) {
            workflowIDs.add(ds.workflowID);
          } else if (ds.type === "listener" && ds.listenerID) {
            listenerIDs.add(ds.listenerID);
          }
        }
      }

      // 2. Extract from widgets array (strings like widget_{widgetID}_{timestamp})
      if (Array.isArray(config.widgets)) {
        for (const wKey of config.widgets) {
          if (typeof wKey === "string" && wKey.startsWith("widget_")) {
            const parts = wKey.split("_");
            if (parts[1]) {
              widgetIDs.add(parts[1]);
            }
          }
        }
      }
    };

    // Extract from req.body
    if (req.body && req.body.appPageConfig) {
      parseConfig(req.body.appPageConfig);
    }

    // Also support root keys if sent directly, just to be safe:
    if (Array.isArray(req.body.dataQueryIDs)) req.body.dataQueryIDs.forEach(id => dataQueryIDs.add(id));
    if (Array.isArray(req.body.workflowIDs)) req.body.workflowIDs.forEach(id => workflowIDs.add(id));
    if (Array.isArray(req.body.widgetIDs)) req.body.widgetIDs.forEach(id => widgetIDs.add(id));
    if (Array.isArray(req.body.listenerIDs)) req.body.listenerIDs.forEach(id => listenerIDs.add(id));

    // Set resolved arrays on req object
    if (dataQueryIDs.size > 0) req.dataQueryIDs = Array.from(dataQueryIDs);
    if (workflowIDs.size > 0) req.workflowIDs = Array.from(workflowIDs);
    if (listenerIDs.size > 0) req.listenerIDs = Array.from(listenerIDs);
    if (widgetIDs.size > 0) req.widgetIDs = Array.from(widgetIDs);

    next();
  } catch (error) {
    Logger.log("error", {
      message: "appPageMiddleware:extractAppPageConfigAssetIDs:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR);
  }
};

/**
 * Middleware to resolve asset IDs (dataqueries, workflows, listeners, widgets)
 * from the database appPageConfig for the clone endpoint.
 */
appPageMiddleware.resolveAppPageCloneAssetIDsFromDB = async (req, res, next) => {
  try {
    const { appPageID } = req.params;
    if (!appPageID) {
      return next();
    }
    const appPage = await prisma.tblAppPages.findUnique({
      where: { appPageID },
      select: { appPageConfig: true }
    });

    if (appPage && appPage.appPageConfig) {
      const config = appPage.appPageConfig;
      const dataQueryIDs = new Set();
      const workflowIDs = new Set();
      const listenerIDs = new Set();
      const widgetIDs = new Set();

      if (Array.isArray(config.dataSources)) {
        for (const ds of config.dataSources) {
          if (ds.type === "query" && ds.queryID) {
            dataQueryIDs.add(ds.queryID);
          } else if (ds.type === "workflow" && ds.workflowID) {
            workflowIDs.add(ds.workflowID);
          } else if (ds.type === "listener" && ds.listenerID) {
            listenerIDs.add(ds.listenerID);
          }
        }
      }

      if (Array.isArray(config.widgets)) {
        for (const wKey of config.widgets) {
          if (typeof wKey === "string" && wKey.startsWith("widget_")) {
            const parts = wKey.split("_");
            if (parts[1]) {
              widgetIDs.add(parts[1]);
            }
          }
        }
      }

      if (dataQueryIDs.size > 0) req.dataQueryIDs = Array.from(dataQueryIDs);
      if (workflowIDs.size > 0) req.workflowIDs = Array.from(workflowIDs);
      if (listenerIDs.size > 0) req.listenerIDs = Array.from(listenerIDs);
      if (widgetIDs.size > 0) req.widgetIDs = Array.from(widgetIDs);
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "appPageMiddleware:resolveAppPageCloneAssetIDsFromDB:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR);
  }
};

module.exports = { appPageMiddleware };
