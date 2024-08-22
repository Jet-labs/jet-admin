const { prisma } = require("../../db/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { sqlite_db } = require("../../db/sqlite");
const {
  appConstantQueryUtils,
} = require("../../utils/postgres-utils/app-constant-queries");
class AppConstantService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmAppConstantTitle
   * @param {object} param0.pmAppConstantValue
   * @param {Boolean} param0.isInternal
   * @returns {any|null}
   */
  static addAppConstant = async ({
    pmAppConstantTitle,
    pmAppConstantValue,
    isInternal,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:addAppConstant:params",
      params: {
        pmAppConstantTitle,
        pmAppConstantValue,
        isInternal,
      },
    });
    try {
      const addAppConstantQuery = sqlite_db.prepare(
        appConstantQueryUtils.addAppConstant()
      );
      addAppConstantQuery.run(
        String(pmAppConstantTitle),
        JSON.stringify(pmAppConstantValue),
        Boolean(isInternal)
      );

      Logger.log("success", {
        message: "AppConstantService:addAppConstant:success",
        params: {
          pmAppConstantTitle,
          pmAppConstantValue,
        },
      });
      return true;
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
   * @param {Number} param0.pmAppConstantID
   * @param {String} param0.pmAppConstantTitle
   * @param {Boolean} param0.isInternal
   * @param {any} param0.pmAppConstantValue
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static updateAppConstant = async ({
    pmAppConstantID,
    pmAppConstantTitle,
    pmAppConstantValue,
    isInternal,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:updateAppConstant:params",
      params: {
        pmAppConstantID,
        pmAppConstantTitle,
        pmAppConstantValue,
        isInternal,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(pmAppConstantID)
      ) {
        // Prepare the SQL statement to update an app constant
        const updateAppConstantQuery = sqlite_db.prepare(
          appConstantQueryUtils.updateAppConstant()
        );

        // Execute the update
        updateAppConstantQuery.run(
          String(pmAppConstantTitle),
          JSON.stringify(pmAppConstantValue),
          Boolean(isInternal),
          pmAppConstantID
        );
        Logger.log("success", {
          message: "AppConstantService:updateAppConstant:success",
        });
        return true;
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
      let appConstants;
      if (authorizedAppConstants === true) {
        // Fetch all appConstants if authorizedAppConstants is true
        const getAllAppConstantsQuery = sqlite_db.prepare(
          appConstantQueryUtils.getAllAppConstants()
        );
        appConstants = getAllAppConstantsQuery.all();
      } else {
        // Fetch appConstants where pm_app_constant_id is in the authorizedAppConstants array
        const getAllAppConstantsQuery = sqlite_db.prepare(
          appConstantQueryUtils.getAllAppConstants(authorizedAppConstants)
        );
        appConstants = getAllAppConstantsQuery.all(...authorizedAppConstants);
      }
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
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static getAllInternalAppConstants = async ({ authorizedAppConstants }) => {
    Logger.log("info", {
      message: "AppConstantService:getAllInternalAppConstants:params",
    });
    try {
      let appConstants;
      if (authorizedAppConstants === true) {
        // Fetch all appConstants if authorizedAppConstants is true
        const getAllAppConstantsQuery = sqlite_db.prepare(
          appConstantQueryUtils.getAllInternalAppConstants()
        );
        appConstants = getAllAppConstantsQuery.all(true);
      } else {
        // Fetch appConstants where pm_app_constant_id is in the authorizedAppConstants array
        const getAllAppConstantsQuery = sqlite_db.prepare(
          appConstantQueryUtils.getAllInternalAppConstants(
            authorizedAppConstants
          )
        );
        appConstants = getAllAppConstantsQuery.all(
          ...authorizedAppConstants,
          true
        );
      }
      Logger.log("info", {
        message: "AppConstantService:getAllInternalAppConstants:appConstants",
        params: {
          appConstantsLength: appConstants?.length,
        },
      });
      return appConstants;
    } catch (error) {
      Logger.log("error", {
        message: "AppConstantService:getAllInternalAppConstants:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmAppConstantID
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static getAppConstantByID = async ({
    pmAppConstantID,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:getAppConstantByID:params",
      params: {
        pmAppConstantID,
        authorizedAppConstants,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(pmAppConstantID)
      ) {
        const getAppConstantByIDQuery = sqlite_db.prepare(
          appConstantQueryUtils.getAppConstantByID()
        );
        const appConstant = getAppConstantByIDQuery.get(pmAppConstantID);
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
   * @param {Number} param0.pmAppConstantID
   * @param {Boolean|Array<Number>} param0.authorizedAppConstants
   * @returns {any|null}
   */
  static deleteAppConstant = async ({
    pmAppConstantID,
    authorizedAppConstants,
  }) => {
    Logger.log("info", {
      message: "AppConstantService:deleteAppConstant:params",
      params: {
        pmAppConstantID,
        authorizedAppConstants,
      },
    });
    try {
      if (
        authorizedAppConstants === true ||
        authorizedAppConstants.includes(pmAppConstantID)
      ) {
        const deleteAppConstantQuery = sqlite_db.prepare(
          appConstantQueryUtils.deleteAppConstant()
        );
        // Execute the delete
        deleteAppConstantQuery.run(pmAppConstantID);
        Logger.log("info", {
          message: "AppConstantService:deleteAppConstant:success",
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
