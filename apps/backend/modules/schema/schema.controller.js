const constants = require("../../constants");
const { generateSQlFromPrismaSchema } = require("../../scripts/generate-sql");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const {
  SCHEMA_INFO_CONSTANTS,
} = require("../../utils/postgres-utils/info-constants");
const { SchemaService } = require("./schema.services");

const schemaController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
schemaController.getSchema = async (req, res) => {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };
  try {
    Logger.log("info", {
      message: "schemaController:getSchema:init",
    });

    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_schemas = state.authorized_schemas;

    Logger.log("info", {
      message: "schemaController:getSchema:params",
      params: {
        pm_user_id,
      },
    });
    if (authorized_schemas === true) {
      const schema = await generateSQlFromPrismaSchema();
      Logger.log("info", {
        message: "schemaController:getSchema:success",
        params: {
          pm_user_id,
        },
      });
      return res.json({
        success: true,
        schema,
      });
    } else {
      Logger.log("error", {
        message: "schemaController:getSchema:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      throw constants.ERROR_CODES.PERMISSION_DENIED;
    }
  } catch (error) {
    Logger.log("error", {
      message: "schemaController:getSchema:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
schemaController.getDatabaseStatistics = async (req, res) => {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };
  try {
    Logger.log("info", {
      message: "schemaController:getDatabaseStatistics:init",
    });

    const schemaStatisticsConstant = {
      "table-level-statistics": {
        raw_query: `SELECT relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch, n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd, n_live_tup, n_dead_tup, n_mod_since_analyze, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze 
FROM pg_stat_user_tables;`,
      },
    };
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_schemas = state.authorized_schemas;

    Logger.log("info", {
      message: "schemaController:getDatabaseStatistics:params",
      params: {
        pm_user_id,
      },
    });
    if (authorized_schemas === true) {
      const schemaStatistics = await SchemaService.getDatabaseStatistics({
        statisticParameter: SCHEMA_INFO_CONSTANTS.TABLE_INFO,
      });
      Logger.log("success", {
        message: "schemaController:getDatabaseStatistics:success",
        params: {
          pm_user_id,
          schemaStatistics,
        },
      });
      return res.json({
        success: true,
        schemaStatistics,
      });
    } else {
      Logger.log("error", {
        message: "schemaController:getDatabaseStatistics:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      throw constants.ERROR_CODES.PERMISSION_DENIED;
    }
  } catch (error) {
    Logger.log("error", {
      message: "schemaController:getDatabaseStatistics:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
schemaController.runSchemaQuery = async (req, res) => {
  try {
    Logger.log("info", {
      message: "schemaController:runSchemaQuery:init",
    });

    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_schemas = state.authorized_schemas;

    Logger.log("info", {
      message: "schemaController:runSchemaQuery:params",
      params: {
        pm_user_id,
      },
    });
    const result = await SchemaService.runSchemaQuery({
      schemaQuery: body.schema_query,
      authorizedSchemas: authorized_schemas,
    });
    Logger.log("info", {
      message: "schemaController:runSchemaQuery:rows",
      params: {
        pm_user_id,
      },
    });
    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    Logger.log("error", {
      message: "schemaController:runSchemaQuery:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { schemaController };
