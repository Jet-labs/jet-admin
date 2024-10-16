const jsep = require("jsep");
const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const {
  evaluateAST,
  extractVariablesFromQuery,
  replaceQueryIDStringWithQueryID,
  replaceAppVariableIDStringWithAppVariableID,
} = require("../../../utils/query-utils/variable-parser");
const {
  isDMLQuery,
  isDQLQuery,
} = require("../../../utils/postgres-utils/query-validation");
const jsonSchemaGenerator = require("json-schema-generator");
const { sqliteDB } = require("../../../db/sqlite");
const {
  queryQueryUtils,
} = require("../../../utils/postgres-utils/query-queries");
const { pgPool } = require("../../../db/pg");
const {
  appVariableQueryUtils,
} = require("../../../utils/postgres-utils/app-variable-queries");
/**
 *
 * @param {object} param0
 * @param {Number} param0.pmQueryID
 * @param {JSON} param0.pmQuery
 * @param {String} param0.pmQueryType
 * @param {JSON} param0.pmQueryArgValues
 * @returns {any|null}
 */
const runQuery = async ({
  pmQueryID,
  pmQuery,
  pmQueryType,
  pmQueryArgValues,
}) => {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };
  try {
    if (isDMLQuery(pmQuery.raw_query) || isDQLQuery(pmQuery.raw_query)) {
      const { processedQuery } = await getProcessedPostgreSQLQuery({
        rawQuery: pmQuery.raw_query,
        pmQueryArgValues,
      });

      Logger.log("info", {
        message: "runQuery:processedQuery",
        params: {
          processedQuery,
          pmQueryArgValues,
        },
      });
      const result = await runPostgreSQLEvaluatedQuery({
        options: { processedQuery, pmQueryType, pmQueryID },
      });
      if (pmQueryID) {
        const resultSchema = jsonSchemaGenerator(
          JSON.parse(JSON.stringify(result.result))
        );
        const updatedQueryQuery = sqliteDB.prepare(
          queryQueryUtils.updateQueryMetadata()
        );
        // Execute the update
        updatedQueryQuery.run(
          JSON.stringify(resultSchema), // Store JSON as TEXT
          pmQueryID
        );
      }
      return result;
    } else {
      Logger.log("error", {
        message: "runQuery:catch-1",
        params: { error: constants.ERROR_CODES.NOT_A_DML_DQL_QUERY },
      });
      throw constants.ERROR_CODES.NOT_A_DML_DQL_QUERY;
    }
  } catch (error) {
    Logger.log("error", {
      message: "runQuery:catch-1",
      params: { error },
    });
    throw error;
  }
};
/**
 *
 * @param {object} param0
 * @param {String} param0.rawQuery
 * @returns
 */
const getProcessedPostgreSQLQuery = async ({ rawQuery, pmQueryArgValues }) => {
  try {
    Logger.log("info", {
      message: "getProcessedPostgreSQLQuery:init",
      params: { rawQuery },
    });

    // variables can be {{[pm_query_id:20].value}} or {{[pm_app_variable_id:20].value}}
    const variableMatches = extractVariablesFromQuery(rawQuery);

    const replacements = variableMatches
      ? await Promise.all(
          variableMatches.map(async (match) => {
            //extract and replace pm_query_id
            const { queryIDStringWithReplacedQueryID, pmQueryIDs } =
              replaceQueryIDStringWithQueryID(match);

            const {
              appVariableIDStringWithReplacedAppVariableID:
                completeReplacedMatch,
              pmAppVariableIDs,
            } = replaceAppVariableIDStringWithAppVariableID(
              `{{${queryIDStringWithReplacedQueryID}}}`
            );

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:replaced",
              params: {
                match,
                queryIDStringWithReplacedQueryID,
                appVariableIDStringWithReplacedAppVariableID:
                  completeReplacedMatch,
                pmQueryIDs,
                pmAppVariableIDs,
              },
            });

            // database values of pm_query_id
            const getAllQueriesQuery = sqliteDB.prepare(
              queryQueryUtils.getAllQueries(pmQueryIDs)
            );
            const getAllAppVariablesQuery = sqliteDB.prepare(
              appVariableQueryUtils.getAllAppVariables(pmAppVariableIDs)
            );
            const extractedPmQuerys =
              pmQueryIDs && pmQueryIDs.length > 0
                ? getAllQueriesQuery.all(...pmQueryIDs)
                : [];
            // database values of pm_query_id
            const extractedPmAppVariables =
              pmAppVariableIDs && pmAppVariableIDs.length > 0
                ? getAllAppVariablesQuery.all(...pmAppVariableIDs)
                : [];

            Logger.log("info", {
              message: "getProcessedPostgreSQLQuery:extractedValues",
              params: {
                extractedPmQuerys,
                extractedPmAppVariables,
                pmQueryArgValues,
              },
            });
            const evaluationContext = { ...pmQueryArgValues };
            const extractedPmQuerysPromises = extractedPmQuerys.map(
              async (pmQueryObject) => {
                const evaluatedQuery = await getProcessedPostgreSQLQuery({
                  rawQuery: JSON.parse(pmQueryObject.pm_query).raw_query,
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
            extractedPmAppVariables.forEach((r) => {
              evaluationContext[`pmac_${r.pm_app_variable_id}`] = JSON.parse(
                r.pm_app_variable_value
              );
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
    if (
      isDMLQuery(options.processedQuery) ||
      isDQLQuery(options.processedQuery)
    ) {
      const res = await pgPool.query(options.processedQuery);
      const result = res.rows;
      Logger.log("info", {
        message: "PostgreSQL:runPostgreSQLEvaluatedQuery:query",
        params: {
          result: Array.isArray(result)
            ? { resultLength: result.length }
            : result,
        },
      });
      return { ...options, result };
    } else {
      Logger.log("error", {
        message: "PostgreSQL:runPostgreSQLEvaluatedQuery:catch-1",
        params: { error: constants.ERROR_CODES.NOT_A_DML_DQL_QUERY },
      });
      throw constants.ERROR_CODES.NOT_A_DML_DQL_QUERY;
    }
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
