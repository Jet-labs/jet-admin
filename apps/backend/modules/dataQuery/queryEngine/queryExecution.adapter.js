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

function buildDataQueryExecutionArgs(argDefinitions = [], inputArgs = {}) {
  const normalizedArgDefinitions = Array.isArray(argDefinitions)
    ? argDefinitions
    : [];

  const mappedArgsToValues = normalizedArgDefinitions.map((arg) => ({
    ...arg,
    value: inputArgs?.[arg.key],
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
  inputArgs = {},
  executionArgs,
}) {
  const activeEngine = engine || createQueryEngine();
  const runtimeArgs =
    executionArgs ?? buildDataQueryExecutionArgs(argDefinitions, inputArgs).kvtObject;

  return activeEngine.executeQuery(dataQueryID, runtimeArgs);
}

module.exports = {
  createQueryEngine,
  buildDataQueryExecutionArgs,
  executeDataQuery,
  defaultQueryFetcher,
  defaultDatasourceFetcher,
};