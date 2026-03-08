const { prisma } = require("../../../config/prisma.config");
const { keyValueTypeArrayToObject } = require("../../../utils/json.util");
const { QueryEngine } = require("./engine");

async function defaultQueryFetcher(queryID) {
  return prisma.tblDataQueries.findFirst({
    where: { dataQueryID: queryID },
  });
}

async function defaultDatasourceFetcher(datasourceID) {
  return prisma.tblDatasources.findFirst({
    where: { datasourceID },
  });
}

function createQueryEngine({
  queryFetcher = defaultQueryFetcher,
  datasourceFetcher = defaultDatasourceFetcher,
} = {}) {
  return new QueryEngine(queryFetcher, datasourceFetcher);
}

function buildDataQueryExecutionArgs(argDefinitions = [], argValues = {}) {
  const normalizedArgDefinitions = Array.isArray(argDefinitions)
    ? argDefinitions
    : [];

  const mappedArgsToValues = normalizedArgDefinitions.map((arg) => ({
    ...arg,
    value: argValues?.[arg.key],
  }));

  return {
    mappedArgsToValues,
    kvtObject: keyValueTypeArrayToObject(mappedArgsToValues),
  };
}

async function executeDataQuery({
  engine,
  dataQueryID,
  argDefinitions = [],
  argValues = {},
  executionArgs,
}) {
  const activeEngine = engine || createQueryEngine();
  const runtimeArgs =
    executionArgs ?? buildDataQueryExecutionArgs(argDefinitions, argValues).kvtObject;

  return activeEngine.executeQuery(dataQueryID, runtimeArgs);
}

module.exports = {
  createQueryEngine,
  buildDataQueryExecutionArgs,
  executeDataQuery,
  defaultQueryFetcher,
  defaultDatasourceFetcher,
};