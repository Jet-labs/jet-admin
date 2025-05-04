const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { databaseService } = require("../database/database.service");
const { aiUtil } = require("../../utils/aiprompt.util");
const { aiService } = require("../ai/ai.service");
const {
  databaseQueryService,
} = require("../databaseQuery/databaseQuery.service");
const environmentVariables = require("../../environment");
const { stringUtil } = require("../../utils/string.util");
const {
  processBarChartQueryResults,
  processLineChartQueryResults,
  processPieChartQueryResults,
  processRadarChartQueryResults,
  processPolarAreaChartQueryResults,
  processScatterChartQueryResults,
  processBubbleChartQueryResults,
} = require("@jet-admin/widgets");
const databaseChartService = {};

/**
 * Service function to retrieve and process database chart data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.dbPool - Database connection pool
 * @param {string} params.tenantID - Tenant ID
 * @param {object} params.databaseChart - Database chart ID
 * @returns {Promise<Object>} Processed chart data with metadata
 */
databaseChartService.getDatabaseChartDataUsingDatabaseChart = async ({
  userID,
  dbPool,
  tenantID,
  databaseChart,
}) => {
  Logger.log("info", {
    message:
      "databaseChartService:getDatabaseChartDataUsingDatabaseChart:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.findMany({
      where: {
        databaseQueryID: {
          in: Array.from(databaseChart.databaseQueries).map((t) =>
            parseInt(t.databaseQueryID)
          ),
        },
      },
    });

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:databaseQueries",
      params: {
        userID,
        tenantID,
        databaseQueries,
      },
    });

    const databaseQueryIDMap = {};
    databaseQueries.forEach((t) => {
      databaseQueryIDMap[t.databaseQueryID] = t;
    });

    // 2. Prepare queries for execution
    const databaseQueriesToExecute = databaseChart.databaseQueries.map(
      (databaseQuery) => ({
        databaseQueryID: databaseQuery.databaseQueryID,
        databaseQueryData: {
          ...databaseQueryIDMap[databaseQuery.databaseQueryID]
            .databaseQueryData,
          databaseQueryArgValues: databaseQuery.databaseQueryArgValues,
        },
      })
    );

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:queries-prepared",
      params: {
        userID,
        tenantID,
        databaseQueriesToExecuteCount: databaseQueriesToExecute.length,
      },
    });

    // 3. Execute all queries
    const databaseQueriesResult = await databaseQueryService.runDatabaseQueries(
      {
        userID,
        tenantID,
        dbPool,
        databaseQueries: databaseQueriesToExecute,
      }
    );

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:databaseQueriesResult",
      params: {
        userID,
        tenantID,
        databaseQueriesResultCount: databaseQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into chart format
    switch (databaseChart.databaseChartType) {
      case constants.DATABASE_CHART_TYPES.BAR_CHART.value:
        processedData = processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.LINE_CHART.value:
        processedData = processLineChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.PIE_CHART.value:
        processedData = processPieChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.RADAR_CHART.value:
        processedData = processRadarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.POLAR_AREA.value:
        processedData = processPolarAreaChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.SCATTER_CHART.value:
        processedData = processScatterChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
        processedData = processBubbleChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      default:
        processedData = processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
    }

    return {
      databaseChartName: databaseChart.databaseChartName,
      lastUpdated: databaseChart.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:catch-1",
      params: {
        error,
        userID,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.aiPrompt
 * @returns
 */
databaseChartService.generateAIPromptBasedChart = async ({
  userID,
  tenantID,
  dbPool,
  aiPrompt,
}) => {
  Logger.log("info", {
    message: "databaseChartService:generateAIPromptBasedChart:started",
    params: { userID, tenantID, aiPrompt },
  });

  // --- Get API Key ---
  const apiKey = environmentVariables.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.log("error", {
      message: "databaseChartService:generateAIPromptBasedChart:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "GEMINI_API_KEY environment variable not set.",
      },
    });
    throw new Error("Server configuration error: Missing Gemini API Key.");
  }

  const databaseSchemaInfo = await databaseService.getDatabaseSchemaForAI({
    userID,
    tenantID,
    dbPool,
  });

  Logger.log("info", {
    message: "databaseChartService:generateAIPromptBasedChart:schema_loaded",
    params: {
      userID,
      tenantID,
      aiPrompt,
      databaseSchemaInfoLength: databaseSchemaInfo?.length,
    },
  });

  if (!databaseSchemaInfo) {
    Logger.log("error", {
      message: "databaseChartService:generateAIPromptBasedChart:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "Database schema information is missing.",
      },
    });
    throw new Error("Database schema information is missing.");
  }

  const fullPrompt = await aiUtil.generateAIPromptForChartGeneration({
    databaseSchemaInfo,
    aiPrompt,
  });

  Logger.log("info", {
    message: "databaseChartService:generateAIPromptBasedChart:prompt_generated",
    params: {
      userID,
      tenantID,
      aiPrompt,
      fullPromptLength: fullPrompt?.length,
    },
  });

  try {
    const databaseChartData = await aiService.generateAIPromptBasedChart({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "databaseChartService:generateAIPromptBasedChart:success",
      params: { userID, tenantID, databaseChartData },
    });
    return stringUtil.removeJSONMarkdownFencesRegex(databaseChartData);
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "databaseChartService:generateAIPromptBasedChart:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error,
      },
    });
    // Re-throw the original error or a more user-friendly one
    throw new Error(
      `Failed to generate database query using AI: ${error.message}`
    );
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.aiPrompt
 * @returns
 */
databaseChartService.generateAIPromptBasedChartStyle = async ({
  userID,
  tenantID,
  dbPool,
  aiPrompt,
  databaseChartData
}) => {
  Logger.log("info", {
    message: "databaseChartService:generateAIPromptBasedChartStyle:started",
    params: { userID, tenantID, aiPrompt, databaseChartData },
  });

  // --- Get API Key ---
  const apiKey = environmentVariables.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.log("error", {
      message: "databaseChartService:generateAIPromptBasedChartStyle:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "GEMINI_API_KEY environment variable not set.",
      },
    });
    throw new Error("Server configuration error: Missing Gemini API Key.");
  }

  const fullPrompt = await aiUtil.generateAIPromptForChartStyleGeneration({
    databaseChartData,
    aiPrompt,
  });
  console.log(fullPrompt);

  Logger.log("info", {
    message: "databaseChartService:generateAIPromptBasedChartStyle:prompt_generated",
    params: {
      userID,
      tenantID,
      aiPrompt,
      fullPromptLength: fullPrompt?.length,
    },
  });

  try {
    const databaseChartData = await aiService.generateAIPromptBasedChartStyle({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "databaseChartService:generateAIPromptBasedChartStyle:success",
      params: { userID, tenantID, databaseChartData },
    });
    return stringUtil.removeJSONMarkdownFencesRegex(databaseChartData);
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "databaseChartService:generateAIPromptBasedChartStyle:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error,
      },
    });
    // Re-throw the original error or a more user-friendly one
    throw new Error(
      `Failed to generate database query using AI: ${error.message}`
    );
  }
};

module.exports = { databaseChartService };
