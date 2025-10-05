const { aiService } = require("./ai.service");
const { expressUtils } = require("../../utils/express.utils");

const { aiUtil } = require("../../utils/aiprompt.util");
const Logger = require("../../utils/logger");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { authService } = require("../auth/auth.service");
const { datasourceService } = require("../datasource/datasource.service");

const aiController = {};

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

    const dataQueries = await dataQueryService.getDataQueriesWithDatasource({
      userID: user.userID,
      tenantID,
    });

    const dataSources = await datasourceService.getAllDatasources({
      userID: user.userID,
      tenantID,
    });

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

module.exports = { aiController };
