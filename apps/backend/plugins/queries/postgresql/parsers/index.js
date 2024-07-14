const jsep = require("jsep");
const constants = require("../../../../constants");
const { prisma } = require("../../../../config/prisma");
const Logger = require("../../../../utils/logger");
const { PostgreSQL, runPostgreSQLQuery } = require("../models");
const { evaluateAST } = require("../../../../utils/parser.util");

/**
 *
 * @param {object} param0
 * @param {String} param0.rawQuery
 * @returns
 */
const getProcessedPostgreSQLQuery = async ({ rawQuery }) => {
  try {
    Logger.log("info", {
      message: "PostgreSQLQuery:getProcessedQuery:init",
      params: { rawQuery },
    });
    const extractedPmQueryIDs = [];

    const variableMatches = rawQuery.match(constants.VARIABLE_DETECTION_REGEX);

    const replacements = await Promise.all(
      variableMatches.map(async (match) => {
        const variableWithReplacedQueryID = String(match)
          .slice(2, -2)
          .replace(constants.PM_QUERY_DETECTION_REGEX, (pmQueryIDString) => {
            const pmQueryID = pmQueryIDString.match(
              constants.PM_QUERY_EXTRACTION_REGEX
            )[1];
            extractedPmQueryIDs.push(parseInt(pmQueryID));
            return `pmq_${pmQueryID}`;
          });
        const extractedPmQuerys = await prisma.tbl_pm_queries.findMany({
          where: {
            pm_query_id: { in: extractedPmQueryIDs },
          },
        });

        const evaluationContext = {};

        const extractedPmQuerysPromises = extractedPmQuerys.map(
          async (pmQuery) => {
            return await runPostgreSQLQuery({
              options: {
                query: pmQuery.pm_query.raw_query,
                pm_query_id: pmQuery.pm_query_id,
              },
            });
          }
        );

        const resolvedPmQuerys = await Promise.all(extractedPmQuerysPromises);

        resolvedPmQuerys.forEach((r) => {
          evaluationContext[`pmq_${r.pm_query_id}`] = r.result;
        });

        Logger.log("info", {
          message:
            "PostgreSQLQuery:getProcessedQuery:variableWithReplacedQueryID",
          params: { variableWithReplacedQueryID, evaluationContext },
        });

        const ast = jsep(variableWithReplacedQueryID);

        const result = evaluateAST(ast, evaluationContext);

        Logger.log("info", {
          message: "PostgreSQLQuery:getProcessedQuery:result",
          params: { result },
        });

        return { match, result };
      })
    );
    Logger.log("info", {
      message: "PostgreSQLQuery:getProcessedQuery:replacements",
      params: { rawQuery: rawQuery, replacements },
    });
    const replacementMap = {};
    replacements.forEach((v) => {
      replacementMap[v.match] = v.result;
    });
    Logger.log("info", {
      message: "PostgreSQLQuery:getProcessedQuery:replacementMap",
      params: { rawQuery: rawQuery, replacementMap },
    });
    const processedPostgreSQLQuery = rawQuery.replace(
      constants.VARIABLE_DETECTION_REGEX,
      (_, variableString) => {
        console.log({ variableString });
        return replacementMap[`{{${variableString}}}`];
      }
    );

    Logger.log("success", {
      message: "PostgreSQLQuery:getProcessedQuery:success",
      params: { rawQuery: rawQuery, processedPostgreSQLQuery },
    });
    return processedPostgreSQLQuery;
  } catch (error) {
    Logger.log("error", {
      message: "PostgreSQLQuery:getProcessedQuery:catch-1",
      params: { rawQuery: rawQuery, error },
    });
    return rawQuery;
  }
};

module.exports = { getProcessedPostgreSQLQuery };

