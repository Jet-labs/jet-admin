const Logger = require("../../utils/logger");
const { postgreSQLQueryUtil } = require("../../utils/postgresql.util");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const databaseTriggerService = {};


/**
 * Retrieves all triggers in a database schema.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @returns {Promise<Array>} - Array of triggers.
 */
databaseTriggerService.getAllDatabaseTriggers = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseTriggerService:getAllDatabaseTriggers:params",
    params: { userID, databaseSchemaName },
  });
  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getAllDatabaseTriggers({ databaseSchemaName })
        );
      }
    );
    const databaseTriggers = result.rows;
    Logger.log("success", {
      message: "databaseTriggerService:getAllDatabaseTriggers:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTriggersLength: databaseTriggers.length,
      },
    });
    return databaseTriggers;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerService:getAllDatabaseTriggers:catch-1",
      params: { userID, databaseSchemaName, error },
    });
    throw error;
  }
};

/**
 * Retrieves a specific trigger by name.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTriggerName
 * @returns {Promise<object>} - The trigger details.
 */
databaseTriggerService.getDatabaseTriggerByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  Logger.log("info", {
    message: "databaseTriggerService:getDatabaseTriggerByName:params",
    params: { userID, databaseSchemaName, databaseTriggerName },
  });
  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseTriggerByName({
            databaseSchemaName,
            databaseTableName,
            databaseTriggerName,
          })
        );
      }
    );
    const databaseTrigger = result.rows[0];
    if (!databaseTrigger) {
      throw new Error(`Trigger not found: ${databaseTriggerName}`);
    }
    Logger.log("success", {
      message: "databaseTriggerService:getDatabaseTriggerByName:success",
      params: { userID, databaseSchemaName, databaseTriggerName },
    });
    return databaseTrigger;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerService:getDatabaseTriggerByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTriggerName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Deletes a trigger by name.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTableName
 * @param {string} param0.databaseTriggerName
 * @returns {Promise<boolean>} - True if the trigger was deleted successfully.
 */
databaseTriggerService.deleteDatabaseTriggerByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  Logger.log("info", {
    message: "databaseTriggerService:deleteDatabaseTriggerByName:params",
    params: { userID, databaseSchemaName, databaseTriggerName },
  });
  try {
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.deleteDatabaseTriggerByName({
            databaseSchemaName,
            databaseTableName,
            databaseTriggerName,
          })
        );
      }
    );
    Logger.log("success", {
      message: "databaseTriggerService:deleteDatabaseTriggerByName:success",
      params: { userID, databaseSchemaName, databaseTriggerName },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerService:deleteDatabaseTriggerByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTriggerName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Creates a new trigger.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName - The schema name (default: "public").
 * @param {string} param0.databaseTableName - The table name.
 * @param {string} param0.databaseTriggerName - The name of the trigger.
 * @param {string} param0.triggerTiming - BEFORE, AFTER, or INSTEAD OF (default: "AFTER").
 * @param {Array<string>} param0.triggerEvents - Array of events: INSERT, UPDATE, DELETE, TRUNCATE.
 * @param {string} param0.triggerFunctionName - The function to execute.
 * @param {string} param0.forEach - ROW or STATEMENT (default: "ROW").
 * @param {string|null} param0.whenCondition - Optional conditional expression for WHEN clause.
 * @param {string|null} param0.referencingOld - Optional alias for OLD rows (for INSTEAD OF triggers).
 * @param {string|null} param0.referencingNew - Optional alias for NEW rows (for INSTEAD OF triggers).
 * @param {boolean} param0.deferrable - Whether the trigger is DEFERRABLE (default: false).
 * @param {boolean} param0.initiallyDeferred - Whether the trigger is INITIALLY DEFERRED (default: false).
 * @returns {Promise<boolean>} - True if the trigger was created successfully.
 */
databaseTriggerService.createDatabaseTrigger = async ({
  userID,
  dbPool,
  databaseSchemaName = "public",
  databaseTableName,
  databaseTriggerName,
  triggerTiming = "AFTER",
  triggerEvents = ["INSERT"],
  triggerFunctionName,
  forEach = "ROW",
  whenCondition = null,
  referencingOld = null,
  referencingNew = null,
  deferrable = false,
  initiallyDeferred = false,
}) => {
  Logger.log("info", {
    message: "databaseTriggerService:createDatabaseTrigger:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
      databaseTriggerName,
      triggerTiming,
      triggerEvents,
      triggerFunctionName,
      forEach,
      whenCondition,
      referencingOld,
      referencingNew,
      deferrable,
      initiallyDeferred,
    },
  });
  try {
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.createDatabaseTrigger({
            databaseSchemaName,
            databaseTableName,
            databaseTriggerName,
            triggerTiming,
            triggerEvents,
            triggerFunctionName,
            forEach,
            whenCondition,
            referencingOld,
            referencingNew,
            deferrable,
            initiallyDeferred,
          })
        );
      }
    );
    Logger.log("success", {
      message: "databaseTriggerService:createDatabaseTrigger:success",
      params: { userID, databaseSchemaName, databaseTriggerName },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerService:createDatabaseTrigger:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTriggerName,
        error,
      },
    });
    throw error;
  }
};


module.exports = { databaseTriggerService };
