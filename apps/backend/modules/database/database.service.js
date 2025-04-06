const Logger = require("../../utils/logger");
const { postgreSQLQueryUtil } = require("../../utils/postgresql.util");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const databaseService = {};

/**
 * Retrieves database metadata.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @returns {Promise<object>}
 */
databaseService.getDatabaseMetadata = async ({ userID, dbPool }) => {
  Logger.log("info", {
    message: "databaseService:getDatabaseMetadata:params",
    params: { userID },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseMetadataQuery()
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:getDatabaseMetadata:result",
      params: { userID },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:getDatabaseMetadata:catch1",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves database metadata.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @returns {Promise<object>}
 */
databaseService.getDatabaseMetadataForTenant = async ({ userID, dbPool }) => {
  Logger.log("info", {
    message: "databaseService:getDatabaseMetadataForTenant:params",
    params: { userID },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseMetadataForTenantQuery()
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:getDatabaseMetadataForTenant:result",
      params: { userID },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:getDatabaseMetadataForTenant:catch1",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

/**
 * Creates a new database schema.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @returns {Promise<object>}
 */
databaseService.createDatabaseSchema = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseService:createDatabaseSchema:params",
    params: { userID, databaseSchemaName },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.createDatabaseSchemaQuery({ databaseSchemaName })
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:createDatabaseSchema:result",
      params: { userID, databaseSchemaName },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:createDatabaseSchema:catch1",
      params: { userID, databaseSchemaName, error: error.message },
    });
    throw error;
  }
};


module.exports = { databaseService };
