const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class AppConstantService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.appConstantTitle
   * @param {object} param0.appConstantValue
   * @returns {any|null}
   */
  static addAppConstant = async ({ appConstantTitle, appConstantValue }) => {
    Logger.log("info", {
      message: "AppConstantService:addAppConstant:params",
      params: {
        appConstantTitle,
        appConstantValue,
      },
    });
    try {
      let newAppConstant = null;

      newAppConstant = await prisma.tbl_pm_app_constants.create({
        data: {
          pm_app_constant_title: String(appConstantTitle),
          pm_app_constant_value: appConstantValue,
        },
      });
      Logger.log("success", {
        message: "AppConstantService:addAppConstant:newAppConstant",
        params: {
          appConstantTitle,
          appConstantValue,
          newAppConstant,
        },
      });
      return newAppConstant;
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:addAppConstant:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.appConstantID
   * @param {String} param0.appConstantTitle
   * @param {any} param0.appConstantValue
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static updateAppConstant = async ({
    appConstantID,
    appConstantTitle,
    appConstantValue,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:updateAppConstant:params",
      params: {
        appConstantID,
        appConstantTitle,
        appConstantValue,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(appConstantID)
      ) {
        const updatedAppConstant = await prisma.tbl_pm_app_constants.update({
          where: {
            pm_app_constant_id: appConstantID,
          },
          data: {
            pm_app_constant_title: String(appConstantTitle),
            pm_app_constant_value: appConstantValue,
          },
        });
        Logger.log("success", {
          message: "AppConstantService:updateAppConstant:updatedAppConstant",
          params: {
            updatedAppConstant,
          },
        });
        return updatedAppConstant;
      } else {
        Logger.log("error", {
          message: "AppConstantService:updateAppConstant:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:updateAppConstant:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static getAllAppConstants = async ({ authorizedAppConstants }) => {
    Logger.log("info", {
      message: "AppConstantService:getAllAppConstants:params",
    });
    try {
      const appConstants = await prisma.tbl_pm_app_constants.findMany({
        where:
          authorizedAppConstants === true
            ? {}
            : {
                pm_app_constant_id: {
                  in: authorizedAppConstants,
                },
              },
      });
      Logger.log("info", {
        message: "AppConstantService:getAllAppConstants:appConstants",
        params: {
          appConstantsLength: appConstants?.length,
        },
      });
      return appConstants;
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:getAllAppConstants:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.appConstantID
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static getAppConstantByID = async ({
    appConstantID,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:getAppConstantByID:params",
      params: {
        appConstantID,
        authorizedAppConstants,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(appConstantID)
      ) {
        const appConstant = await prisma.tbl_pm_app_constants.findUnique({
          where: {
            pm_app_constant_id: appConstantID,
          },
        });
        Logger.log("info", {
          message: "AppConstantService:getAppConstantByID:appConstant",
          params: {
            appConstant,
          },
        });
        return appConstant;
      } else {
        Logger.log("error", {
          message: "AppConstantService:getAppConstantByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:getAppConstantByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.appConstantID
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static deleteAppConstant = async ({
    appConstantID,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:deleteAppConstant:params",
      params: {
        appConstantID,
        authorizedAppConstants,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(appConstantID)
      ) {
        const appConstant = await prisma.tbl_pm_app_constants.delete({
          where: {
            pm_app_constant_id: appConstantID,
          },
        });
        Logger.log("info", {
          message: "AppConstantService:deleteAppConstant:appConstant",
          params: {
            appConstant,
          },
        });
        return true;
      } else {
        Logger.log("error", {
          message: "AppConstantService:deleteAppConstant:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:deleteAppConstant:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { AppConstantService };
