const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class SchemaService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {JSON} param0.schemaQuery
   * @param {Boolean|Array<Number>} param0.authorizedSchemas
   * @returns {any|null}
   */
  static runSchemaQuery = async ({ schemaQuery, authorizedSchemas }) => {
    Logger.log("info", {
      message: "SchemaService:runSchemaQuery:params",
      params: { schemaQuery },
    });

    try {
      if (authorizedSchemas === true) {
        const result = await prisma.$queryRaw`${Prisma.raw(
          schemaQuery.raw_query
        )}`;

        Logger.log("info", {
          message: "SchemaService:runSchemaQuery:query",
        });
        return result;
      } else {
        Logger.log("error", {
          message: "SchemaService:runSchemaQuery:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "SchemaService:runSchemaQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { SchemaService };
