const { Prisma } = require("@prisma/client");
const { prisma } = require("../../../../config/prisma");
const Logger = require("../../../../utils/logger");

const runPostgreSQLQuery = async ({ options }) => {
  Logger.log("info", {
    message: "PostgreSQL:run:params",
    params: { options },
  });
  try {
    const result = await prisma.$queryRaw`${Prisma.raw(options.query)}`;
    Logger.log("info", {
      message: "PostgreSQL:run:query",
      params: {
        result: Array.isArray(result)
          ? { resultLength: result.length }
          : result,
      },
    });
    return { pm_query_id: options.pm_query_id, result };
  } catch (error) {
    Logger.log("error", {
      message: "PostgreSQL:run:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { runPostgreSQLQuery };
