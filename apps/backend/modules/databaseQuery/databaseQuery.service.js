const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const jsonSchemaGenerator = require("json-schema-generator");
const { postgreSQLParserUtil } = require("../../utils/postgresql.util");
const environmentVariables = require("../../environment");
const { databaseService } = require("../database/database.service");
const {
  HarmCategory,
  HarmBlockThreshold,
  GoogleGenerativeAI,
} = require("@google/generative-ai");
const databaseQueryService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseQueryService.getAllDatabaseQueries = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "databaseQueryService:getAllDatabaseQueries:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
      include: {
        _count: {
          select: {
            tblDatabaseChartQueryMappings: true,
            tblDatabaseWidgetQueryMappings: true,
          },
        },
      },
    });

    // Transform the result to include counts in a more accessible format
    const transformedQueries = databaseQueries.map((query) => ({
      ...query,
      linkedDatabaseChartCount: query._count.tblDatabaseChartQueryMappings,
      linkedDatabaseWidgetCount: query._count.tblDatabaseWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    }));

    Logger.log("success", {
      message: "databaseQueryService:getAllDatabaseQueries:success",
      params: {
        userID,
        databaseQueries: transformedQueries,
      },
    });
    return transformedQueries;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getAllDatabaseQueries:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.databaseQueryTitle
 * @param {string} param0.databaseQueryDescription
 * @param {JSON} param0.databaseQueryData
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.createDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueryTitle = "Untitled",
  databaseQueryDescription = null,
  databaseQueryData = null,
  runOnLoad = false,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:createDatabaseQuery:params",
    params: {
      userID,
      tenantID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    },
  });

  try {
    await prisma.tblDatabaseQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        creatorID: parseInt(userID),
        runOnLoad,
      },
    });
    Logger.log("success", {
      message: "databaseQueryService:createDatabaseQuery:success",
      params: {
        userID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:createDatabaseQuery:failure",
      params: {
        userID,
        error: error.message,
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
databaseQueryService.generateAIPromptBasedQuery = async ({
  userID,
  tenantID,
  dbPool,
  aiPrompt,
}) => {
  const entryTime = Date.now();
  Logger.log("info", {
    message: "databaseQueryService:generateAIPromptBasedQuery:started",
    params: { userID, tenantID, aiPrompt },
  });

  // --- Get API Key ---
  const apiKey = environmentVariables.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "GEMINI_API_KEY environment variable not set.",
      },
      durationMs: Date.now() - entryTime,
    });
    throw new Error("Server configuration error: Missing Gemini API Key.");
  }

  // --- IMPORTANT: Define or Fetch Your Database Schema ---
  // The AI *needs* to know your table structure to write queries.
  // This is a simplified example; you'll need a robust way to get this,
  // possibly based on tenantID.
  let databaseSchemaInfo;
  try {
    // Replace with your actual schema fetching logic
    // databaseSchemaInfo = await getSchemaForTenant(tenantID);
    databaseSchemaInfo = await databaseService.getDatabaseSchemaForAI({
      userID,
      dbPool,
    });
    console.log("databaseSchemaInfo", databaseSchemaInfo);
    Logger.log("info", {
      message: "databaseQueryService:generateAIPromptBasedQuery:schema_loaded",
      params: { userID, tenantID },
      // Avoid logging the full schema if it's sensitive or very large
      databaseSchemaInfo,
      schemaLength: databaseSchemaInfo?.length || 0,
    });
  } catch (schemaError) {
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: `Failed to load database schema: ${schemaError.message}`,
      },
      durationMs: Date.now() - entryTime,
    });
    throw new Error(`Failed to load database schema: ${schemaError.message}`);
  }

  if (!databaseSchemaInfo) {
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "Database schema information is missing.",
      },
      durationMs: Date.now() - entryTime,
    });
    throw new Error("Database schema information is missing.");
  }

  // --- Construct the Prompt for Gemini ---
  const fullPrompt = `
      Based on the following database schema:
      ${databaseSchemaInfo}

      Generate a concise and valid SQL SELECT query that fulfills the user's request.
      User Request: "${aiPrompt}"

      Rules:
      1. ONLY return the SQL query. Do not include any explanations, introductory text, markdown formatting (like \`\`\`sql), or anything other than the SQL statement itself.
      2. Ensure the query is syntactically correct for standard SQL (or specify target like PostgreSQL/MySQL if needed).
      3. Adhere to the constraints mentioned in the schema description (e.g., tenant filtering, SELECT only).
      4. For any error return the exact text: "QUERY_GENERATION_FAILED"

      SQL Query:
    `; // The "SQL Query:" helps guide the model to start generating the query immediately.

  try {
    // --- Initialize Gemini Client ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Or "gemini-1.5-pro" for potentially better results but higher cost/latency
      // Safety settings can be adjusted if needed, but defaults are generally good.
      // See: https://ai.google.dev/docs/safety_setting_gemini
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
      message: "databaseQueryService:generateAIPromptBasedQuery:calling_gemini",
      params: { userID, tenantID },
      promptLength: fullPrompt.length,
    });

    // --- Call Gemini API ---
    const result = await model.generateContent(fullPrompt);
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
          "databaseQueryService:generateAIPromptBasedQuery:gemini_empty_response",
        params: { userID, tenantID, aiPrompt, response },
        durationMs: Date.now() - entryTime,
      });
      throw new Error(
        "AI model returned an empty or invalid response structure."
      );
    }

    // Check for safety blocks
    if (response.candidates[0].finishReason !== "STOP") {
      Logger.log("warning", {
        message:
          "databaseQueryService:generateAIPromptBasedQuery:gemini_blocked",
        params: {
          userID,
          tenantID,
          aiPrompt,
          finishReason: response.candidates[0].finishReason,
          safetyRatings: response.candidates[0].safetyRatings,
        },
        durationMs: Date.now() - entryTime,
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
          "databaseQueryService:generateAIPromptBasedQuery:gemini_no_text",
        params: { userID, tenantID, aiPrompt },
        durationMs: Date.now() - entryTime,
      });
      throw new Error("AI model returned response with no text content.");
    }

    // Check if the AI refused based on our instruction
    if (databaseQuery === "QUERY_GENERATION_FAILED") {
      Logger.log("warning", {
        message:
          "databaseQueryService:generateAIPromptBasedQuery:generation_failed_flag",
        params: { userID, tenantID, aiPrompt },
        durationMs: Date.now() - entryTime,
      });
      throw new Error(
        "AI determined the request could not be safely converted to a SQL query based on the provided schema and rules."
      );
    }

    // Basic validation (can be expanded)
    if (!databaseQuery.toUpperCase().startsWith("SELECT")) {
      Logger.log("warning", {
        message:
          "databaseQueryService:generateAIPromptBasedQuery:invalid_query_start",
        params: { userID, tenantID, aiPrompt, generatedText: databaseQuery },
        durationMs: Date.now() - entryTime,
      });
      // It might have returned an explanation despite instructions, or failed in another way.
      throw new Error("AI model did not return a valid SELECT query.");
    }

    // --- Success ---
    Logger.log("success", {
      message: "databaseQueryService:generateAIPromptBasedQuery:success",
      params: { userID, tenantID /* aiPrompt - already logged */ },
      // Be cautious logging the full query if it could contain sensitive info based on the prompt
      // generatedQuery: databaseQuery
      generatedQueryLength: databaseQuery.length,
      durationMs: Date.now() - entryTime,
    });
    return databaseQuery;
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        // Avoid logging the full prompt if it's very large or sensitive
        promptLength: fullPrompt?.length,
        error: error.message,
        // Include stack trace for debugging if your logger supports it
        // stack: error.stack
      },
      durationMs: Date.now() - entryTime,
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
 * @param {object} param0.dbPool
 * @param {Array<{databaseQueryID:number,databaseQueryData:{databaseQueryString:string,databaseQueryArgValues:object,databaseQueryArgs:object}}>} param0.databaseQueries
 * @returns {Promise<Array<object>>}
 */

databaseQueryService.runDatabaseQueries = async ({
  userID,
  tenantID,
  dbPool,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runDatabaseQueries:start",
    params: {
      userID,
      tenantID,
      databaseQueriesCount: databaseQueries.length,
    },
  });

  try {
    // Execute with connection pooling
    const databaseQueriesResult =
      await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
        dbPool,
        async (client) => {
          const executionPromises = databaseQueries.map(
            async (databaseQuery, index) => {
              try {
                // Process and execute query
                const { query: processedQuery, values: processedQueryValues } =
                  postgreSQLParserUtil.processDatabaseQuery(
                    databaseQuery.databaseQueryData
                  );

                Logger.log("info", {
                  message:
                    "databaseQueryService:runDatabaseQueries:processDatabaseQuery",
                  params: {
                    userID,
                    tenantID,
                    processedQuery,
                    processedQueryValues,
                  },
                });

                const databaseQueryResult = await client.query(
                  processedQuery,
                  processedQueryValues
                );

                Logger.log("info", {
                  message:
                    "databaseQueryService:runDatabaseQueries:databaseQueryResult",
                  params: {
                    userID,
                    tenantID,
                    processedQuery,
                    processedQueryValues,
                  },
                });

                // Update schema if needed
                if (databaseQuery.databaseQueryID) {
                  const databaseQueryResultSchema = jsonSchemaGenerator(
                    JSON.parse(JSON.stringify(databaseQueryResult.rows))
                  );
                  await prisma.tblDatabaseQueries.update({
                    where: {
                      databaseQueryID: parseInt(databaseQuery.databaseQueryID),
                    },
                    data: {
                      databaseQueryResultSchema: databaseQueryResultSchema,
                    },
                  });
                }

                return {
                  success: true,
                  queryIndex: index,
                  result: databaseQueryResult.rows,
                  databaseQueryID: databaseQuery.databaseQueryID,
                };
              } catch (error) {
                Logger.log("error", {
                  message: "databaseQueryService:runDatabaseQueries:catch-2",
                  params: {
                    userID,
                    tenantID,
                    queryIndex: index,
                    error,
                  },
                });
                return {
                  success: false,
                  queryIndex: index,
                  error,
                  databaseQueryID: databaseQuery.databaseQueryID,
                };
              }
            }
          );

          return Promise.all(executionPromises);
        }
      );
    Logger.log("success", {
      message: "databaseQueryService:runDatabaseQueries:success",
      params: {
        userID,
        tenantID,
        databaseQueriesCount: databaseQueries.length,
        databaseQueriesResultCount: databaseQueriesResult.length,
      },
    });
    return databaseQueriesResult;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:runDatabaseQueries:catch-1",
      params: {
        userID,
        tenantID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Get database query by ID
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @returns {Promise<object>}
 */
databaseQueryService.getDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:getDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
    },
  });

  try {
    const databaseQuery = await prisma.tblDatabaseQueries.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseQueryID: parseInt(databaseQueryID),
      },
      include: {
        _count: {
          select: {
            tblDatabaseChartQueryMappings: true,
            tblDatabaseWidgetQueryMappings: true,
          },
        },
      },
    });

    if (!databaseQuery) {
      throw new Error(`Database query with ID ${databaseQueryID} not found`);
    }

    // Transform the result to include counts in a more accessible format
    const transformedQuery = {
      ...databaseQuery,
      linkedDatabaseChartCount:
        databaseQuery._count.tblDatabaseChartQueryMappings,
      linkedDatabaseWidgetCount:
        databaseQuery._count.tblDatabaseWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    };

    Logger.log("success", {
      message: "databaseQueryService:getDatabaseQueryByID:success",
      params: {
        userID,
        databaseQuery: transformedQuery,
      },
    });
    return transformedQuery;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getDatabaseQueryByID:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @param {string} param0.databaseQueryTitle
 * @param {string} param0.databaseQueryDescription
 * @param {JSON} param0.databaseQueryData
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.updateDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
  databaseQueryTitle,
  databaseQueryDescription,
  databaseQueryData,
  runOnLoad,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:updateDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseQueries.update({
      where: {
        databaseQueryID: parseInt(databaseQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
      data: {
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
      },
    });

    Logger.log("success", {
      message: "databaseQueryService:updateDatabaseQueryByID:success",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:updateDatabaseQueryByID:failure",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @returns {Promise<boolean>}
 */
databaseQueryService.deleteDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:deleteDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseQueries.delete({
      where: {
        databaseQueryID: parseInt(databaseQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "databaseQueryService:deleteDatabaseQueryByID:success",
      params: {
        userID,
        tenantID,
        databaseQueryID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:deleteDatabaseQueryByID:failure",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        error: error.message,
      },
    });
    throw error;
  }
};

module.exports = { databaseQueryService };
