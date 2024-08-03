const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { SchemaService } = require("./schema.services");

const schemaController = {};

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
