/**
 * Data Query Node Handler
 * Executes database queries using the QueryEngine
 */
const { QueryEngine } = require('../../../dataQuery/queryEngine/engine');
const { prisma } = require('../../../../config/prisma.config');
const { ERROR_HANDLING, NEXT_HANDLE } = require('./constants');

// Query and datasource fetchers for QueryEngine
const queryFetcher = async (id) => {
  return prisma.tblDataQueries.findUnique({
    where: { dataQueryID: id },
  });
};

const datasourceFetcher = async (id) => {
  return prisma.tblDatasources.findUnique({
    where: { datasourceID: id },
  });
};

async function execute(nodeConfig, context, helpers) {
  const { resolveFromContext } = helpers;
  const { 
    dataQueryID, 
    args = {}, 
    outputVariable = 'queryResult',
    errorHandling = ERROR_HANDLING.CONTINUE,
  } = nodeConfig || {};
  
  if (!dataQueryID) {
    throw new Error('Data Query node requires dataQueryID');
  }
  
  // Resolve arguments - only resolve values with "ctx." prefix from context
  const resolvedArgs = {};
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.startsWith('ctx.')) {
      // Resolve from context (e.g., "ctx.data.someField" -> context value)
      resolvedArgs[key] = resolveFromContext(value);
    } else {
      // Use value as-is
      resolvedArgs[key] = value;
    }
  }
  
  try {
    // Execute query using QueryEngine
    const engine = new QueryEngine(queryFetcher, datasourceFetcher);
    const result = await engine.executeQuery(dataQueryID, resolvedArgs);
    
    return {
      output: {
        [outputVariable]: result,
        success: true,
      },
      nextHandle: NEXT_HANDLE.SUCCESS,
    };
  } catch (error) {
    // If errorHandling is FAIL_WORKFLOW, throw to stop the workflow
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) {
      throw error;
    }
    
    // Otherwise, return error output and follow error handle
    return {
      output: {
        [outputVariable]: null,
        success: false,
        error: error.message,
      },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}

module.exports = { execute };
