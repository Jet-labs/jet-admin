const { aiService } = require("./mcp.service");
const { expressUtils } = require("../../utils/express.utils");

const { aiUtil } = require("../../utils/aiprompt.util");
const Logger = require("../../utils/logger");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { authService } = require("../auth/auth.service");
const { datasourceService } = require("../datasource/datasource.service");

const aiController = {};
const mcpController = {};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
mcpController.generateUserPromptIntent = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const { user} = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "mcpController:generateUserPromptIntent:params",
      params: {
        userPrompt,
        userID: user.userID,
        tenantID,
      },
    });
    // Generate AI Prompt for extracting User Intent
    const userIntentPrompt = await aiUtil.generateUserPromptIntent({
      userPrompt,
    });
    Logger.log("info", {
      message: "mcpController:generateUserPromptIntent:ai_prompt",
      params: { userIntentPrompt },
    });
    // Get AI Response for User Intent
    const userIntentResponse = await aiService.generateUserPromptIntent({
     aiPrompt:  userIntentPrompt,
    });
    Logger.log("info", {
      message: "mcpController:generateUserPromptIntent:ai_response",
      params: { userIntentResponse },
    });
    const datasources = await datasourceService.getAllDatasources({
      userID: parseInt(user.userID),
      tenantID,
    });
    Logger.log("info", {
      message: "mcpController:generateUserPromptIntent:datasources",
      params: { datasources },
    });
    // Generate AI Prompt for Datasource Selection
    const identifiedDatasourcesPrompt =
      aiUtil.generateAIPromptForDatasourceSelection({
        userPrompt: userIntentResponse,
        datasources: datasources,
      });
    Logger.log("info", {
      message: "mcpController:generateUserPromptIntent:ai_prompt",
      params: { identifiedDatasourcesPrompt },
    });
    // Get AI Response for Datasource Selection
    const identifiedDatasources = await aiService.getDatasourceBasedOnIntent({
      aiPrompt: identifiedDatasourcesPrompt,
    });
    Logger.log("success", {
      message: "mcpController:generateUserPromptIntent:success",
      params: {
        identifiedDatasources,
      },
    });
    return expressUtils.sendResponse(res, true, { identifiedDatasources });
  } catch (error) {
    Logger.log("error", {
      message: "mcpController:generateUserPromptIntent:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};
/**
 * 
 * @param {object} param0
 * @param {string} param0.aiPrompt
 * @param {string} param0.firebaseID 
 * @param {string} param0.tenantID
 * @returns 
 */
aiController.generateAIPromptForChatVisualization = async ({ aiPrompt ,firebaseID,tenantID }) => {
  try {
    
    Logger.log("info", {
      message: "aiController:generateAIPromptForChatVisualization:params",
      params: {
        aiPrompt,
        firebaseID,
        tenantID,
      },
    });
    const user = await authService.getUserFromFirebaseID({ firebaseID });
    if (!user) {
      throw new Error("User not found");
    }
    Logger.log("info", {
      message: "aiController:generateAIPromptForChatVisualization:user",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const dataQueries = await dataQueryService.getDataQueriesWithDatasource(
      {
        userID: parseInt(user.userID),
        tenantID,
      }
    );

    const dataSources = await datasourceService.getAllDatasources(
      {
        userID: parseInt(user.userID),
        tenantID,
      }
    );

    Logger.log("info", {
      message: "aiController:generateAIPromptForChatVisualization:schema",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesLength: dataQueries?.length,
      },
    });

    const fullPrompt = await aiUtil.generateAIPromptForChatVisualization({
      dataQueries:dataQueries,
      dataSources:dataSources,
      aiPrompt,
    });

    Logger.log("info", {
      message: "aiController:generateAIPromptForChatVisualization:prompt",
      params: {
        userID: user.userID,
        tenantID,
        fullPrompt,
      },
    });

    const chatResponse = await aiService.generateAIPromptForChatVisualization({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "aiController:generateAIPromptForChatVisualization:success",
      params: {
        userID: user.userID,
        tenantID,
        chatResponse,
      },
    });

    return chatResponse;
  } catch (error) {
    Logger.log("error", {
      message: "aiController:generateAIPromptBasedChartStyle:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {string} param0.aiPrompt
 * @returns
 */
aiController.generateRechartsJSXFromQueryResult = async ({ aiPrompt,firebaseID,tenantID }) => {
  try {
    Logger.log("info", {
      message: "aiController:generateRechartsJSXFromQueryResult:params",
      params: {
        firebaseID,
        tenantID,
        aiPrompt,
      },
    });
    const dataQueryData = aiPrompt.dataQueryData;

    const user = await authService.getUserFromFirebaseID({ firebaseID });
    if (!user) {
        Logger.log("error", {
          message: "aiController:generateRechartsJSXFromQueryResult:user_not_found",
          params: {
            firebaseID,
            tenantID,
          },
        });
      throw new Error("User not found");
    }
    const dataQueryResult = await dataQueryService.runDataQueryByData({userID:user.userID,tenantID,dataQuery:dataQueryData});
    Logger.log("info", {
      message: "aiController:generateRechartsJSXFromQueryResult:dataQueryResult",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryResult,
      },
    });
    const fullPrompt = await aiUtil.generateAIVizPromptWithJSX({
      aiPrompt,
      dataQueryResult,
      dataQuery:dataQueryData,
    });

    Logger.log("info", {
      message: "aiController:generateRechartsJSXFromQueryResult:prompt",
      params: {
        firebaseID,
        tenantID,
        fullPrompt,
      },
    });

    const rechartsJSX = await aiService.generateRechartsJSXFromQueryResult({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "aiController:generateRechartsJSXFromQueryResult:success",
      params: {
        userID: firebaseID,
        tenantID,
        rechartsJSX,
      },
    });

    return rechartsJSX;
  } catch (error) {
    Logger.log("error", {
      message: "aiController:generateRechartsJSXFromQueryResult:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { aiController, mcpController };
