const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const Logger = require("../../utils/logger");
const environmentVariables = require("../../environment");
const { stringUtil } = require("../../utils/string.util");

const aiService = {};

aiService.generateAIPromptBasedQuery = async ({ aiPrompt }) => {
  try {
    if (!aiPrompt) {
      Logger.log("error", {
        message: "aiService:generateAIPromptBasedQuery:failure",
        params: {
          aiPrompt,
          error: "AI Prompt is missing.",
        },
      });
      throw new Error("AI Prompt is missing.");
    }
    const apiKey = environmentVariables.GEMINI_API_KEY;
    if (!apiKey) {
      Logger.log("error", {
        message: "aiService:generateAIPromptBasedQuery:failure",
        params: {
          aiPromptLength: aiPrompt?.length,
          error: "GEMINI_API_KEY environment variable not set.",
        },
      });
      throw new Error("Server configuration error: Missing Gemini API Key.");
    }
    // --- Initialize Gemini Client ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    Logger.log("info", {
      message: "aiService:generateAIPromptBasedQuery:calling_gemini",
      params: { aiPromptLength: aiPrompt?.length },
    });

    // --- Call Gemini API ---
    const result = await model.generateContent(aiPrompt);
    Logger.log('warning', {
      message: "aiService:generateAIPromptBasedQuery:result",
      params: { result },
    });
    const response = await result.response;

    // --- Extract and Validate Query ---
    if (
      !response ||
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0
    ) {
      Logger.log("warning", {
        message:
          "aiService:generateAIPromptBasedQuery:gemini_empty_response",
        params: { aiPromptLength: aiPrompt?.length, response },
      });
      throw new Error(
        "AI model returned an empty or invalid response structure."
      );
    }

    // Check for safety blocks
    if (response.candidates[0].finishReason !== "STOP") {
      Logger.log("warning", {
        message:
          "aiService:generateAIPromptBasedQuery:gemini_blocked",
        params: {
          aiPromptLength: aiPrompt?.length,
          finishReason: response.candidates[0].finishReason,
          safetyRatings: response.candidates[0].safetyRatings,
        },
      });
      // You might want specific error messages based on safetyRatings if available
      throw new Error(
        `AI model stopped generation due to safety settings or other limit (Reason: ${response.candidates[0].finishReason}).`
      );
    }

    // Extract the text, trim whitespace
    const databaseQuery = response.candidates[0].content.parts[0].text?.trim();

    if (!databaseQuery) {
      Logger.log("warning", {
        message:
          "aiService:generateAIPromptBasedQuery:gemini_no_text",
        params: { aiPromptLength: aiPrompt?.length },
      });
      throw new Error("AI model returned response with no text content.");
    }

    // Check if the AI refused based on our instruction
    if (databaseQuery === "QUERY_GENERATION_FAILED") {
      Logger.log("warning", {
        message:
          "aiService:generateAIPromptBasedQuery:generation_failed_flag",
        params: { aiPromptLength: aiPrompt?.length },
      });
      throw new Error(
        "AI determined the request could not be safely converted to a SQL query based on the provided schema and rules."
      );
    }
    return stringUtil.removeMarkdownFencesRegex(databaseQuery);
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "aiService:generateAIPromptBasedQuery:failure",
      params: {
        aiPromptLength: aiPrompt?.length,
        error,
      },
    });
    // Re-throw the original error or a more user-friendly one
    throw new Error(
      `Failed to generate database query using AI: ${error.message}`
    );
  }
};

aiService.generateAIPromptBasedChart = async ({ aiPrompt }) => {
  try {
    if (!aiPrompt) {
      Logger.log("error", {
        message: "aiService:generateAIPromptBasedChart:failure",
        params: {
          aiPrompt,
          error: "AI Prompt is missing.",
        },
      });
      throw new Error("AI Prompt is missing.");
    }
    const apiKey = environmentVariables.GEMINI_API_KEY;
    if (!apiKey) {
      Logger.log("error", {
        message: "aiService:generateAIPromptBasedChart:failure",
        params: {
          aiPromptLength: aiPrompt?.length,
          error: "GEMINI_API_KEY environment variable not set.",
        },
      });
      throw new Error("Server configuration error: Missing Gemini API Key.");
    }
    // --- Initialize Gemini Client ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    Logger.log("info", {
      message: "aiService:generateAIPromptBasedChart:calling_gemini",
      params: { aiPromptLength: aiPrompt?.length },
    });

    // --- Call Gemini API ---
    const result = await model.generateContent(aiPrompt);
    Logger.log("warning", {
      message: "aiService:generateAIPromptBasedChart:result",
      params: { result },
    });
    const response = await result.response;

    // --- Extract and Validate Query ---
    if (
      !response ||
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0
    ) {
      Logger.log("warning", {
        message: "aiService:generateAIPromptBasedChart:gemini_empty_response",
        params: { aiPromptLength: aiPrompt?.length, response },
      });
      throw new Error(
        "AI model returned an empty or invalid response structure."
      );
    }

    // Check for safety blocks
    if (response.candidates[0].finishReason !== "STOP") {
      Logger.log("warning", {
        message: "aiService:generateAIPromptBasedChart:gemini_blocked",
        params: {
          aiPromptLength: aiPrompt?.length,
          finishReason: response.candidates[0].finishReason,
          safetyRatings: response.candidates[0].safetyRatings,
        },
      });
      // You might want specific error messages based on safetyRatings if available
      throw new Error(
        `AI model stopped generation due to safety settings or other limit (Reason: ${response.candidates[0].finishReason}).`
      );
    }

    // Extract the text, trim whitespace
    const databaseChartData =
      response.candidates[0].content.parts[0].text?.trim();

    if (!databaseChartData) {
      Logger.log("warning", {
        message: "aiService:generateAIPromptBasedChart:gemini_no_text",
        params: { aiPromptLength: aiPrompt?.length },
      });
      throw new Error("AI model returned response with no text content.");
    }

    // // Check if the AI refused based on our instruction
    // if (databaseChartData === "QUERY_GENERATION_FAILED") {
    //   Logger.log("warning", {
    //     message: "aiService:generateAIPromptBasedChart:generation_failed_flag",
    //     params: { aiPromptLength: aiPrompt?.length },
    //   });
    //   throw new Error(
    //     "AI determined the request could not be safely converted to a SQL query based on the provided schema and rules."
    //   );
    // }
    return databaseChartData;
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "aiService:generateAIPromptBasedChart:failure",
      params: {
        aiPromptLength: aiPrompt?.length,
        error,
      },
    });
    // Re-throw the original error or a more user-friendly one
    throw new Error(
      `Failed to generate database query using AI: ${error.message}`
    );
  }
};

module.exports = { aiService };
