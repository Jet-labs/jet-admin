const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const Logger = require("../../utils/logger");
const { BaseQuery } = require("../baseQuery");

class PostgreSQL extends BaseQuery {
  constructor({ raw_query }) {
    super({ raw_query });
    this.raw_query = raw_query;
  }

  run = async () => {
    Logger.log("info", {
      message: "PostgreSQL:run:params",
    });
    try {
      const result = await prisma.$queryRaw`${Prisma.raw(this.raw_query)}`;
      Logger.log("info", {
        message: "PostgreSQL:run:query",
        params: {
          result: Array.isArray(result)
            ? { resultLength: result.length }
            : result,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "PostgreSQL:run:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { PostgreSQL };
