const jsep = require("jsep");
const constants = require("../../constants");
const { prisma } = require("../../config/prisma");
const Logger = require("../../utils/logger");
const {
  evaluateAST,
  extractVariablesFromQuery,
  replaceQueryIDStringWithQueryID,
  replaceAppConstantIDStringWithAppConstantID,
} = require("../../utils/parser.util");
const { Prisma } = require("@prisma/client");

/**
 *
 * @param {object} param0
 * @param {Number} param0.pmQueryID
 * @param {JSON} param0.pmQuery
 * @param {String} param0.pmQueryType
 * @returns {any|null}
 */
const runQuery = async ({ pmQueryID, pmQuery, pmQueryType }) => {
  try {
    const { processedQuery } = await getProcessedPostgreSQLQuery({
      rawQuery: pmQuery.raw_query,
    });

    Logger.log("info", {
      message: "runQuery:processedQuery",
      params: {
        processedQuery,
      },
    });
    return await runPostgreSQLEvaluatedQuery({
      options: { processedQuery, pmQueryType, pmQueryID },
    });
  } catch (error) {
    Logger.log("error", {
      message: "runQuery:catch-1",
      params: { error },
    });
    return { pmQueryID, result: null };
  }
};
/**
 *
 * @param {object} param0
 * @param {String} param0.rawQuery
 * @returns
 */
const getProcessedPostgreSQLQuery = async ({ rawQuery }) => {
  try {
    Logger.log("info", {
      message: "getProcessedPostgreSQLQuery:init",
      params: { rawQuery },
    });

    // variables can be {{[pm_query_id:20].value}} or {{[pm_app_constant_id:20].value}}
    const variableMatches = extractVariablesFromQuery(rawQuery);

    const replacements = variableMatches
      ? await Promise.all(
          variableMatches.map(async (match) => {
            //extract and replace pm_query_id
            const { queryIDStringWithReplacedQueryID, pmQueryIDs } =
              replaceQueryIDStringWithQueryID(match);

            const {
              appConstantIDStringWithReplacedAppConstantID:
                completeReplacedMatch,
              pmAppConstantIDs,
            } = replaceAppConstantIDStringWithAppConstantID(
              `{{${queryIDStringWithReplacedQueryID}}}`
            );

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:replaced",
              params: {
                match,
                queryIDStringWithReplacedQueryID,
                appConstantIDStringWithReplacedAppConstantID:
                  completeReplacedMatch,
                pmQueryIDs,
                pmAppConstantIDs,
              },
            });

            // database values of pm_query_id
            const extractedPmQuerys =
              pmQueryIDs && pmQueryIDs.length > 0
                ? await prisma.tbl_pm_queries.findMany({
                    where: {
                      pm_query_id: { in: pmQueryIDs },
                      is_disabled: false,
                    },
                  })
                : [];
            // database values of pm_query_id
            const extractedPmAppConstants =
              pmAppConstantIDs && pmAppConstantIDs.length > 0
                ? await prisma.tbl_pm_app_constants.findMany({
                    where: {
                      pm_app_constant_id: { in: pmAppConstantIDs },
                      is_disabled: false,
                    },
                  })
                : [];

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:extractedValues",
              params: { extractedPmQuerys, extractedPmAppConstants },
            });
            const evaluationContext = {};
            const extractedPmQuerysPromises = extractedPmQuerys.map(
              async (pmQueryObject) => {
                const evaluatedQuery = await getProcessedPostgreSQLQuery({
                  rawQuery: pmQueryObject.pm_query.raw_query,
                });
                return await runPostgreSQLEvaluatedQuery({
                  options: {
                    pmQueryID: pmQueryObject.pm_query_id,
                    ...evaluatedQuery,
                  },
                });
              }
            );

            const resolvedPmQuerys = await Promise.all(
              extractedPmQuerysPromises
            );

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:resolvedPmQuerys",
              params: { resolvedPmQuerysLength: resolvedPmQuerys.length },
            });
            resolvedPmQuerys.forEach((r) => {
              evaluationContext[`pmq_${r.pmQueryID}`] = r.result;
            });
            extractedPmAppConstants.forEach((r) => {
              evaluationContext[`pmac_${r.pm_app_constant_id}`] =
                r.pm_app_constant_value;
            });

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:completeReplacedMatch",
              params: {
                completeReplacedMatch,
              },
            });

            const ast = jsep(completeReplacedMatch);

            const result = evaluateAST(ast, evaluationContext);

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:result",
              params: { result, ast },
            });

            return { match, result };
          })
        )
      : null;
    Logger.log("info", {
      message: "getProcessedPostgreSQLQuery:replacements",
      params: { rawQuery: rawQuery, replacements },
    });
    const replacementMap = {};
    replacements?.forEach((v) => {
      replacementMap[v.match] = v.result;
    });
    Logger.log("info", {
      message: "getProcessedPostgreSQLQuery:replacementMap",
      params: { rawQuery: rawQuery, replacementMap },
    });
    const processedPostgreSQLQuery = rawQuery.replace(
      constants.VARIABLE_DETECTION_REGEX,
      (_, variableString) => {
        return replacementMap[`{{${variableString}}}`];
      }
    );

    Logger.log("success", {
      message: "getProcessedPostgreSQLQuery:success",
      params: { rawQuery: rawQuery, processedPostgreSQLQuery },
    });
    return { processedQuery: processedPostgreSQLQuery };
  } catch (error) {
    Logger.log("error", {
      message: "getProcessedPostgreSQLQuery:catch-1",
      params: { rawQuery: rawQuery, error },
    });
    return { processedQuery: rawQuery };
  }
};

const runPostgreSQLEvaluatedQuery = async ({ options }) => {
  Logger.log("info", {
    message: "PostgreSQL:runPostgreSQLEvaluatedQuery:params",
    params: { options },
  });
  try {
    const result = await prisma.$queryRaw`${Prisma.raw(
      options.processedQuery
    )}`;
    Logger.log("info", {
      message: "PostgreSQL:runPostgreSQLEvaluatedQuery:query",
      params: {
        result: Array.isArray(result)
          ? { resultLength: result.length }
          : result,
      },
    });
    return { ...options, result };
  } catch (error) {
    Logger.log("error", {
      message: "PostgreSQL:runPostgreSQLEvaluatedQuery:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = {
  getProcessedPostgreSQLQuery,
  runPostgreSQLEvaluatedQuery,
  runQuery,
};
