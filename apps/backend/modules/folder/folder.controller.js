/**
 * Folder Controller
 * Express request handlers for folder CRUD and entity moves.
 */
const { folderService } = require("./folder.service");
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const folderController = {};

folderController.getAllFolders = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { entityType } = req.query;

    const folders = await folderService.listFolders({ tenantID, entityType });

    return expressUtils.sendResponse(
      res,
      true,
      { folders, message: "Folders fetched successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", { message: "folderController:getAllFolders:error", params: { error } });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

folderController.createFolder = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const data = req.body;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "folderController:createFolder:params",
      params: { userID: user.userID, tenantID, data },
    });

    const folder = await folderService.createFolder({
      tenantID,
      userID: user.userID,
      authContext,
      data,
    });

    return expressUtils.sendResponse(
      res,
      true,
      { folder, message: "Folder created successfully." },
      null,
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    Logger.log("error", { message: "folderController:createFolder:error", params: { error } });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

folderController.updateFolder = async (req, res) => {
  try {
    const { tenantID, folderID } = req.params;
    const data = req.body;

    const folder = await folderService.updateFolder({ tenantID, folderID, data });

    return expressUtils.sendResponse(
      res,
      true,
      { folder, message: "Folder updated successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", { message: "folderController:updateFolder:error", params: { error } });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

folderController.deleteFolder = async (req, res) => {
  try {
    const { tenantID, folderID } = req.params;

    await folderService.deleteFolder({ tenantID, folderID });

    return expressUtils.sendResponse(
      res,
      true,
      { message: "Folder deleted successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", { message: "folderController:deleteFolder:error", params: { error } });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

folderController.moveEntitiesToFolder = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { entityType, entityIDs, folderID } = req.body;

    const result = await folderService.moveEntitiesToFolder({
      tenantID,
      entityType,
      entityIDs,
      folderID: folderID ?? null,
    });

    return expressUtils.sendResponse(
      res,
      true,
      { ...result, message: "Items moved successfully." },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", { message: "folderController:moveEntitiesToFolder:error", params: { error } });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { folderController };
