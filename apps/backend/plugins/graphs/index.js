const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { getQueryObject } = require("../queries");
const { PostgreSQL } = require("./postgresql/models");

/**
 *
 * @param {object} param0
 * @param {Number} param0.
 */
const runGraphSource = async ({ pmQueryID }) => {
  try {
    const query = await prisma.tbl_pm_queries.findUnique({
      where: {
        pm_query_id: parseInt(pmQueryID),
      },
    });
    const queryModel = getQueryObject({
      pmQueryType: query.pm_query_type,
      pmQuery: query.pm_query,
    });
    return await queryModel.run();
  } catch (error) {
    Logger.log("error", {
      message: "runGraphSource:catch-1",
      params: { error },
    });
  }
};

/**
 *
 * @param {object} param0
 * @param {Array<Number>} param0.pmQueryIDs
 */
const runAllGraphSources = async ({ pmQueryIDs }) => {
  try {
    const dataArrayPromise = pmQueryIDs.map((pmQueryID) => {
      return runGraphSource({ pmQueryID });
    });

    return await Promise.all(dataArrayPromise);
  } catch (error) {
    Logger.log("error", {
      message: "runAllGraphSources:catch-1",
      params: { error },
    });
  }
};
module.exports = { runGraphSource, runAllGraphSources };
