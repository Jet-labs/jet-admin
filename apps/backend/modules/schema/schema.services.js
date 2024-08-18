const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  SCHEMA_INFO_CONSTANTS,
} = require("../../utils/postgres-utils/db-info-queries");
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

  /**
   *
   * @param {object} param0
   * @param {JSON} param0.statisticParameter
   * @returns {any|null}
   */
  static getDatabaseStatistics = async () => {
    Logger.log("info", {
      message: "SchemaService:getDatabaseStatistics:init",
    });
    try {
      const finalResult = [];
      const promises = Object.keys(SCHEMA_INFO_CONSTANTS).map((key) => {
        finalResult.push({
          result: null,
          name: key,
          result_type: SCHEMA_INFO_CONSTANTS[key].result_type,
        });
        return prisma.$queryRaw`${Prisma.raw(
          SCHEMA_INFO_CONSTANTS[key].raw_query
        )}`;
      });
      const results = await Promise.all(promises);
      results.forEach((result, index) => {
        finalResult[index].result = result;
      });

      Logger.log("success", {
        message: "SchemaService:getDatabaseStatistics:success",
      });
      return finalResult;
    } catch (error) {
      Logger.log("error", {
        message: "SchemaService:getDatabaseStatistics:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { SchemaService };
