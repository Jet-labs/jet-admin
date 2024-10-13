const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { sqliteDB } = require("../../db/sqlite");
const {
  appVariableQueryUtils,
} = require("../../utils/postgres-utils/app-variable-queries");
class AppVariableService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmAppVariableTitle
   * @param {object} param0.pmAppVariableValue
   * @param {Boolean} param0.isInternal
   * @returns {any|null}
   */
  static addAppVariable = async ({
    pmAppVariableTitle,
    pmAppVariableValue,
    isInternal,
  }) => {
    Logger.log("info", {
      message: "AppVariableService:addAppVariable:params",
      params: {
        pmAppVariableTitle: String(pmAppVariableTitle),
        pmAppVariableValue: JSON.stringify(pmAppVariableValue),
        isInternal: Boolean(isInternal),
      },
    });
    try {
      const addAppVariableQuery = sqliteDB.prepare(
        appVariableQueryUtils.addAppVariable()
      );

      addAppVariableQuery.run(
        String(pmAppVariableTitle),
        JSON.stringify(pmAppVariableValue), // Ensure this is a string
        Boolean(isInternal) ? 1 : 0
      );

      Logger.log("success", {
        message: "AppVariableService:addAppVariable:success",
        params: {
          pmAppVariableTitle,
          pmAppVariableValue,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:addAppVariable:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmAppVariableID
   * @param {String} param0.pmAppVariableTitle
   * @param {Boolean} param0.isInternal
   * @param {any} param0.pmAppVariableValue
   * @param {Boolean|Array<Number>} param0.authorizedAppVariables
   * @returns {any|null}
   */
  static updateAppVariable = async ({
    pmAppVariableID,
    pmAppVariableTitle,
    pmAppVariableValue,
    isInternal,
    authorizedAppVariables,
  }) => {
    Logger.log("info", {
      message: "AppVariableService:updateAppVariable:params",
      params: {
        pmAppVariableID,
        pmAppVariableTitle,
        pmAppVariableValue,
        isInternal,
      },
    });
    try {
      if (
        authorizedAppVariables === true ||
        authorizedAppVariables.includes(pmAppVariableID)
      ) {
        // Prepare the SQL statement to update an app variable
        const updateAppVariableQuery = sqliteDB.prepare(
          appVariableQueryUtils.updateAppVariable()
        );

        // Execute the update
        updateAppVariableQuery.run(
          String(pmAppVariableTitle),
          JSON.stringify(pmAppVariableValue),
          Boolean(isInternal) ? 1 : 0,
          pmAppVariableID
        );
        Logger.log("success", {
          message: "AppVariableService:updateAppVariable:success",
        });
        return true;
      } else {
        Logger.log("error", {
          message: "AppVariableService:updateAppVariable:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:updateAppVariable:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedAppVariables
   * @returns {any|null}
   */
  static getAllAppVariables = async ({ authorizedAppVariables }) => {
    Logger.log("info", {
      message: "AppVariableService:getAllAppVariables:params",
    });
    try {
      let appVariables;
      if (authorizedAppVariables === true) {
        // Fetch all appVariables if authorizedAppVariables is true
        const getAllAppVariablesQuery = sqliteDB.prepare(
          appVariableQueryUtils.getAllAppVariables()
        );
        appVariables = getAllAppVariablesQuery.all();
      } else {
        // Fetch appVariables where pm_app_variable_id is in the authorizedAppVariables array
        const getAllAppVariablesQuery = sqliteDB.prepare(
          appVariableQueryUtils.getAllAppVariables(authorizedAppVariables)
        );
        appVariables = getAllAppVariablesQuery.all(...authorizedAppVariables);
      }
      Logger.log("info", {
        message: "AppVariableService:getAllAppVariables:appVariables",
        params: {
          appVariablesLength: appVariables,
        },
      });
      return appVariables;
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:getAllAppVariables:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedAppVariables
   * @returns {any|null}
   */
  static getAllInternalAppVariables = async ({ authorizedAppVariables }) => {
    Logger.log("info", {
      message: "AppVariableService:getAllInternalAppVariables:params",
    });
    try {
      let appVariables;
      if (
        authorizedAppVariables === true ||
        authorizedAppVariables === null ||
        authorizedAppVariables === undefined
      ) {
        // Fetch all appVariables if authorizedAppVariables is true
        const getAllAppVariablesQuery = sqliteDB.prepare(
          appVariableQueryUtils.getAllInternalAppVariables()
        );
        appVariables = getAllAppVariablesQuery.all();
      } else {
        // Fetch appVariables where pm_app_variable_id is in the authorizedAppVariables array
        const getAllAppVariablesQuery = sqliteDB.prepare(
          appVariableQueryUtils.getAllInternalAppVariables(
            authorizedAppVariables
          )
        );
        appVariables = getAllAppVariablesQuery.all(...authorizedAppVariables);
      }
      Logger.log("info", {
        message: "AppVariableService:getAllInternalAppVariables:appVariables",
        params: {
          appVariablesLength: appVariables?.length,
        },
      });
      return appVariables;
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:getAllInternalAppVariables:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmAppVariableID
   * @param {Boolean|Array<Number>} param0.authorizedAppVariables
   * @returns {any|null}
   */
  static getAppVariableByID = async ({
    pmAppVariableID,
    authorizedAppVariables,
  }) => {
    Logger.log("info", {
      message: "AppVariableService:getAppVariableByID:params",
      params: {
        pmAppVariableID,
        authorizedAppVariables,
      },
    });
    try {
      if (
        authorizedAppVariables === true ||
        authorizedAppVariables.includes(pmAppVariableID)
      ) {
        const getAppVariableByIDQuery = sqliteDB.prepare(
          appVariableQueryUtils.getAppVariableByID()
        );
        const appVariable = getAppVariableByIDQuery.get(pmAppVariableID);
        Logger.log("info", {
          message: "AppVariableService:getAppVariableByID:appVariable",
          params: {
            appVariable,
          },
        });
        return appVariable;
      } else {
        Logger.log("error", {
          message: "AppVariableService:getAppVariableByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:getAppVariableByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmAppVariableID
   * @param {Boolean|Array<Number>} param0.authorizedAppVariables
   * @returns {any|null}
   */
  static deleteAppVariable = async ({
    pmAppVariableID,
    authorizedAppVariables,
  }) => {
    Logger.log("info", {
      message: "AppVariableService:deleteAppVariable:params",
      params: {
        pmAppVariableID,
        authorizedAppVariables,
      },
    });
    try {
      if (
        authorizedAppVariables === true ||
        authorizedAppVariables.includes(pmAppVariableID)
      ) {
        const deleteAppVariableQuery = sqliteDB.prepare(
          appVariableQueryUtils.deleteAppVariable()
        );
        // Execute the delete
        deleteAppVariableQuery.run(pmAppVariableID);
        Logger.log("info", {
          message: "AppVariableService:deleteAppVariable:success",
        });
        return true;
      } else {
        Logger.log("error", {
          message: "AppVariableService:deleteAppVariable:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AppVariableService:deleteAppVariable:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { AppVariableService };
