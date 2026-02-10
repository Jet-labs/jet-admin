const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const Logger = require("../../utils/logger");
const environmentVariables = require("../../environment");

const aiService = {};
// Using Flash for speed and lower cost in the Planner phase
const AI_MODEL = 'gemini-flash-latest'; // Fast, supports JSON mode, 1M input tokens

/**
 * PHASE 1: THE PLANNER
 * Determines intent (Chat vs Data), generates SQL, and assigns confidence.
 */
aiService.generateQueryPlan = async ({ userPrompt, schemaContext, conversationHistory = [] }) => {
  try {
    const apiKey = environmentVariables.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      // Force JSON mode for reliability
      generationConfig: { responseMimeType: "application/json" }
    });

    const historyStr = conversationHistory.slice(-6).map(h => `User: ${h.user}\nAI: ${h.assistant}`).join("\n");

    const systemPrompt = `
      You are an expert Data & SQL Assistant for a PostgreSQL database. 
      Your goal is to analyze the user's request and decide if it requires a database query or just a conversational response.
      
      DATABASE SCHEMA:
      ${schemaContext}

      PREVIOUS CONTEXT:
      ${historyStr}

      USER PROMPT: "${userPrompt}"

      CRITICAL SQL RULES (CASE SENSITIVITY):
      1. PostgreSQL treats unquoted identifiers as lowercase. 
      2. You MUST double-quote ("") ANY table or column name that contains uppercase letters.
      3. Look at the SCHEMA exactly. 
         - If schema says "tblBookings", using tblBookings will FAIL. You MUST generate: SELECT * FROM "tblBookings"
         - If schema says "createdAt", using createdAt will FAIL. You MUST generate: WHERE "createdAt" > ...
      4. Only use single quotes ('') for string values (e.g., WHERE status = 'COMPLETED').

      INSTRUCTIONS:
      1. Classify INTENT: 
         - "CHAT": General greeting, thank you, or questions unrelated to the database data.
         - "QUERY": User asks for data, specific records, analysis, or insights from the DB.
      
      2. If INTENT is "QUERY":
         - Generate a read-only PostgreSQL query (SELECT/WITH/EXPLAIN only).
         - LIMIT 100 unless the user asks for a count or specific number.
         - Double check every identifier against the schema for case sensitivity.
      
      3. Calculate CONFIDENCE (0.0 to 1.0):
         - 1.0 = I found the exact tables/columns and mapped them perfectly.
         - 0.5 = I am guessing the column names.
      
      4. Suggest VISUALIZATION:
         - Should this data be charted? (true/false)
         - Suggested Type: 'bar', 'line', 'pie', 'scatter', 'area', or null.

      OUTPUT JSON FORMAT:
      {
        "intent": "CHAT" | "QUERY",
        "sql": "SELECT ... " | null,
        "conversational_response": "..." (If intent is CHAT, or a polite intro if QUERY),
        "confidence": 0.0 - 1.0,
        "visualization_needed": boolean,
        "suggested_chart_type": string | null,
        "reasoning": "Brief explanation of why you chose this table/column and chart type"
      }
    `;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.candidates[0].content.parts[0].text;
    return JSON.parse(text);

  } catch (error) {
    Logger.log("error", { message: "aiService:generateQueryPlan:fail", error: error.message });
    throw error;
  }
};

/**
 * PHASE 2: THE ANALYST
 * Combines Insights and Chart Generation into a SINGLE call.
 */
aiService.analyzeAndVisualize = async ({ userPrompt, dataResults, chartType }) => {
  try {
    if (!dataResults || dataResults.rows.length === 0) return null;

    const apiKey = environmentVariables.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODEL, generationConfig: { responseMimeType: "application/json" } });

    // We only send a sample to keep tokens low, but enough for context
    const sampleData = dataResults.rows.slice(0, 50);

    const prompt = `
      You are a Data Analyst. Analyze the dataset below and provide insights AND a chart configuration.

      USER QUESTION: ${userPrompt}
      DATA COLUMNS: ${JSON.stringify(dataResults.columns)}
      ROW COUNT: ${dataResults.rowCount}
      SAMPLE DATA: ${JSON.stringify(sampleData)}
      PREFERRED CHART: ${chartType}

      TASK:
      1. INSIGHTS: Provide 2-3 bullet points of actionable business intelligence in Markdown. Use emojis (📈, 📉, ⚠️).
      2. CHART CONFIG: Provide the Recharts configuration.
         - Identify the best X-axis key (usually a date or category).
         - Identify the best Data keys (numeric values).
         - Pick professional colors.

      OUTPUT JSON FORMAT:
      {
        "insights_markdown": "### Key Findings\n\n* 📈 ...\n* ⚠️ ...",
        "chart_config": {
          "type": "${chartType || 'bar'}",
          "xAxisKey": "exact_column_name_from_data",
          "dataKeys": ["col1", "col2"],
          "colors": ["#8884d8", "#82ca9d", "#ffc658"],
          "title": "Chart Title"
        }
      }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.candidates[0].content.parts[0].text);

  } catch (error) {
    Logger.log("error", { message: "aiService:analyzeAndVisualize:fail", error: error.message });
    return null; // Fail gracefully, user still gets the table
  }
};

/**
 * STREAMING VERSION: Yields chunks as they arrive, then final parsed JSON
 * @param {boolean} readOnlyMode - If true, prompts AI to generate analysis for write queries
 * @yields {{ type: 'chunk', data: string } | { type: 'complete', data: object }}
 */
aiService.generateQueryPlanStream = async function* ({ userPrompt, schemaContext, conversationHistory = [], readOnlyMode = true }) {
  try {
    const apiKey = environmentVariables.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const historyStr = conversationHistory.slice(-6).map(h => `User: ${h.user}\nAI: ${h.assistant}`).join("\n");

    // Add read-only mode instructions if active
    const readOnlyInstructions = readOnlyMode ? `
      READ-ONLY MODE IS ACTIVE:
      - If the user requests a WRITE operation (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, etc.):
        1. Still generate the SQL they requested in "sql" field
        2. Set "intent" to "WRITE" 
        3. IMPORTANT: Also generate an "affected_data_query" - a SELECT query that shows what data would be affected
           Example: For "DELETE FROM users WHERE status = 'inactive'", generate:
           affected_data_query: "SELECT * FROM users WHERE status = 'inactive' LIMIT 50"
        4. In "reasoning", explain what the query would do to the data
      - READ queries (SELECT, WITH, EXPLAIN) work normally
    ` : `
      FULL ACCESS MODE:
      - All queries (read and write) can be executed
      - Generate the appropriate SQL for the user's request
    `;

    const systemPrompt = `
      You are an expert Data & SQL Assistant for a PostgreSQL database. 
      Your goal is to analyze the user's request and decide if it requires a database query or just a conversational response.
      
      DATABASE SCHEMA:
      ${schemaContext}

      PREVIOUS CONTEXT:
      ${historyStr}

      USER PROMPT: "${userPrompt}"

      ${readOnlyInstructions}

      CRITICAL SQL RULES (CASE SENSITIVITY):
      1. PostgreSQL treats unquoted identifiers as lowercase. 
      2. You MUST double-quote ("") ANY table or column name that contains uppercase letters.
      3. Look at the SCHEMA exactly. 
         - If schema says "tblBookings", using tblBookings will FAIL. You MUST generate: SELECT * FROM "tblBookings"
         - If schema says "createdAt", using createdAt will FAIL. You MUST generate: WHERE "createdAt" > ...
      4. Only use single quotes ('') for string values (e.g., WHERE status = 'COMPLETED').

      INSTRUCTIONS:
      1. Classify INTENT: 
         - "CHAT": General greeting, thank you, or questions unrelated to the database data.
         - "QUERY": User asks for data, specific records, analysis, or insights from the DB (READ operation).
         - "WRITE": User asks to INSERT, UPDATE, DELETE, CREATE, DROP, ALTER data (WRITE operation).
      
      2. If INTENT is "QUERY" or "WRITE":
         - Generate the appropriate PostgreSQL query.
         - For QUERY: LIMIT 100 unless the user asks for a count or specific number.
         - For WRITE: Generate both the write query AND an affected_data_query (SELECT to preview affected rows)
         - Double check every identifier against the schema for case sensitivity.
      
      3. Calculate CONFIDENCE (0.0 to 1.0):
         - 1.0 = I found the exact tables/columns and mapped them perfectly.
         - 0.5 = I am guessing the column names.
      
      4. Suggest VISUALIZATION:
         - Should this data be charted? (true/false)
         - Suggested Type: 'bar', 'line', 'pie', 'scatter', 'area', or null.

      OUTPUT JSON FORMAT:
      {
        "intent": "CHAT" | "QUERY" | "WRITE",
        "sql": "SELECT/INSERT/UPDATE/DELETE ... " | null,
        "affected_data_query": "SELECT ... " | null (only for WRITE intent - shows what rows would be affected),
        "conversational_response": "..." (If intent is CHAT, or a polite intro if QUERY/WRITE),
        "confidence": 0.0 - 1.0,
        "visualization_needed": boolean,
        "suggested_chart_type": string | null,
        "reasoning": "Brief explanation of what this query does and why you chose this table/column"
      }
    `;

    const result = await model.generateContentStream(systemPrompt);
    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        yield { type: 'chunk', data: chunkText };
      }
    }

    // Parse the complete JSON at the end
    const parsed = JSON.parse(fullText);
    yield { type: 'complete', data: parsed };

  } catch (error) {
    Logger.log("error", { message: "aiService:generateQueryPlanStream:fail", error: error.message });
    throw error;
  }
};

/**
 * STREAMING VERSION: Yields analysis chunks as they arrive
 * @yields {{ type: 'chunk', data: string } | { type: 'complete', data: object }}
 */
aiService.analyzeAndVisualizeStream = async function* ({ userPrompt, dataResults, chartType }) {
  try {
    if (!dataResults || dataResults.rows.length === 0) {
      yield { type: 'complete', data: null };
      return;
    }

    const apiKey = environmentVariables.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: AI_MODEL,
      generationConfig: { responseMimeType: "application/json" } 
    });

    const sampleData = dataResults.rows.slice(0, 50);

    const prompt = `
      You are a Data Analyst. Analyze the dataset below and provide insights AND a chart configuration.

      USER QUESTION: ${userPrompt}
      DATA COLUMNS: ${JSON.stringify(dataResults.columns)}
      ROW COUNT: ${dataResults.rowCount}
      SAMPLE DATA: ${JSON.stringify(sampleData)}
      PREFERRED CHART: ${chartType}

      TASK:
      1. INSIGHTS: Provide 2-3 bullet points of actionable business intelligence in Markdown. Use emojis (📈, 📉, ⚠️).
      2. CHART CONFIG: Provide the Recharts configuration.
         - Identify the best X-axis key (usually a date or category).
         - Identify the best Data keys (numeric values).
         - Pick professional colors.

      OUTPUT JSON FORMAT:
      {
        "insights_markdown": "### Key Findings\\n\\n* 📈 ...\\n* ⚠️ ...",
        "chart_config": {
          "type": "${chartType || 'bar'}",
          "xAxisKey": "exact_column_name_from_data",
          "dataKeys": ["col1", "col2"],
          "colors": ["#8884d8", "#82ca9d", "#ffc658"],
          "title": "Chart Title"
        }
      }
    `;

    const result = await model.generateContentStream(prompt);
    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        yield { type: 'chunk', data: chunkText };
      }
    }

    // Parse the complete JSON at the end
    const parsed = JSON.parse(fullText);
    yield { type: 'complete', data: parsed };

  } catch (error) {
    Logger.log("error", { message: "aiService:analyzeAndVisualizeStream:fail", error: error.message });
    yield { type: 'complete', data: null }; // Fail gracefully
  }
};

module.exports = { aiService };