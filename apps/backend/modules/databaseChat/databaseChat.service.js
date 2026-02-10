
const { databaseService } = require("../database/database.service");
const Logger = require("../../utils/logger");
const { aiService } = require("../ai/ai.service");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
/**
 * List of SQL keywords that indicate a write operation
 */
const WRITE_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "CREATE",
  "ALTER",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "EXECUTE",
];

const databaseChatService = {};

/**
 * Validates that a query is read-only (SELECT only)
 * @param {string} query - SQL query to validate
 * @returns {boolean} - True if valid, throws error if not
 */
databaseChatService.validateReadOnlyQuery = (query) => {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid query: Query must be a non-empty string");
  }

  const normalizedQuery = query.trim().toUpperCase();

  // Check for write keywords
  for (const keyword of WRITE_KEYWORDS) {
    // Match keyword at start of query or after whitespace/semicolon
    const regex = new RegExp(`(^|\\s|;)${keyword}\\s`, "i");
    if (regex.test(normalizedQuery)) {
      throw new Error(
        `Query rejected: ${keyword} operations are not allowed. Only SELECT queries are permitted.`
      );
    }
  }

  // Ensure query starts with SELECT, WITH, or EXPLAIN
  if (
    !normalizedQuery.startsWith("SELECT") &&
    !normalizedQuery.startsWith("WITH") &&
    !normalizedQuery.startsWith("EXPLAIN")
  ) {
    throw new Error(
      "Query rejected: Only SELECT, WITH, or EXPLAIN queries are allowed."
    );
  }

  return true;
};

/**
 * Checks if a query is a write operation (INSERT, UPDATE, DELETE, etc.)
 * @param {string} query - SQL query to check
 * @returns {boolean} - True if it's a write query
 */
databaseChatService.isWriteQuery = (query) => {
  if (!query || typeof query !== "string") {
    return false;
  }

  const normalizedQuery = query.trim().toUpperCase();

  for (const keyword of WRITE_KEYWORDS) {
    const regex = new RegExp(`(^|\\s|;)${keyword}\\s`, "i");
    if (regex.test(normalizedQuery)) {
      return true;
    }
  }

  return false;
};

/**
 * Execute a validated query against the database
 * @param {object} dbPool - Database connection pool
 * @param {string} query - SQL query to execute
 * @returns {Promise<object>} - Query results
 */
databaseChatService.executeQuery = async (dbPool, query) => {
  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query);
      }
    );

    return {
      rows: result.rows,
      rowCount: result.rowCount,
      columns: result.fields ? result.fields.map((f) => f.name) : [],
    };
  } catch (error) {
    Logger.log("error", {
      message: "databaseChatService:executeQuery:catch",
      params: { query, error: error.message },
    });
    throw new Error(`Query execution failed: ${error.message}`);
  }
};

/**
 * THE UNIFIED GATEWAY
 * Single entry point for all User <-> Database AI interactions.
 */
databaseChatService.processUserRequest = async ({ userID, tenantID, message, history, dbPool }) => {
  const startTime = Date.now();

  // 1. Context Loading
  const schema = await databaseService.getDatabaseSchemaForAI({ userID, tenantID, dbPool });

  // 2. Phase 1: The Plan (1st LLM Call)
  const plan = await aiService.generateQueryPlan({
    userPrompt: message,
    schemaContext: schema,
    conversationHistory: history
  });

  Logger.log("info", {
    message: "databaseChatService:processUserRequest",
    intent: plan.intent,
    confidence: plan.confidence
  });

  // FAST EXIT: Normal Chat
  if (plan.intent === "CHAT" || !plan.sql) {
    return {
      type: "response",
      content: [
        { type: "markdown", content: plan.conversational_response }
      ],
      metadata: { confidence: plan.confidence, mode: "conversational" }
    };
  }

  // 3. Execution Phase
  let queryResults = null;
  let executionError = null;

  try {
    // Safety Check from your existing service
    databaseChatService.validateReadOnlyQuery(plan.sql);

    // Execute
    queryResults = await databaseChatService.executeQuery(dbPool, plan.sql);
  } catch (err) {
    executionError = err.message;
    // Fallback: If SQL fails, we return the error but try to be helpful
    return {
      type: "database_response", // FIX: Use standard type
      content: [                 // FIX: Rename 'blocks' to 'content'
        { type: "error", content: `Query execution failed: ${err.message}` }, // Use 'error' type for better styling
        { type: "sql", content: plan.sql, collapsible: true, title: "Failed Query" }
      ]
    };
  }

  // 4. Phase 2: Analysis & Visualization (2nd LLM Call - OPTIONAL)
  // Only call if we have results and the plan suggested it needed visualization or complex data
  let analysis = null;

  if (queryResults.rowCount > 0 && queryResults.rowCount < 1000) {
    analysis = await aiService.analyzeAndVisualize({
      userPrompt: message,
      dataResults: queryResults,
      chartType: plan.suggested_chart_type
    });
  }

  // 5. Construct Rich Response
  const responseBlocks = [];

  // Block A: The conversational intro (from Planner)
  if (plan.conversational_response) {
    responseBlocks.push({ type: "markdown", content: plan.conversational_response });
  }

  // Handle Empty Results explicitly
  if (queryResults.rowCount === 0) {
    responseBlocks.push({ type: "markdown", content: "**No records found matching your query.**" });
  }

  // Block B: Analysis (from Analyst)
  if (analysis && analysis.insights_markdown) {
    responseBlocks.push({ type: "markdown", content: analysis.insights_markdown });
  }

  // Block C: The Chart (Programmatically generated JSX wrapper)
  if (analysis && analysis.chart_config) {
    const jsx = generateRechartsJSX(analysis.chart_config, queryResults.rows);
    responseBlocks.push({
      type: "chart",
      chartType: analysis.chart_config.type,
      jsx: jsx,
      data: queryResults.rows
    });
  }

  // Block D: The Data Table
  responseBlocks.push({
    type: "table",
    columns: queryResults.columns,
    rows: queryResults.rows,
    rowCount: queryResults.rowCount,
    interactive: true
  });

  // Block E: The SQL (Collapsible footer)
  responseBlocks.push({
    type: "sql",
    content: plan.sql,
    collapsible: true,
    title: "View SQL Source"
  });

  return {
    type: "database_response",
    content: responseBlocks,
    metadata: {
      confidence: plan.confidence,
      processingTime: Date.now() - startTime,
      tokensSaved: "High" // Conceptual metric
    }
  };
};

/**
 * STREAMING VERSION: Generator that yields SSE events
 * @param {object} params
 * @param {boolean} params.readOnlyMode - If true, write queries are analyzed but not executed
 * @yields {{ type: string, data: any }}
 */
databaseChatService.processUserRequestStream = async function* ({ userID, tenantID, message, history, dbPool, readOnlyMode = true }) {
  const startTime = Date.now();

  // 1. Context Loading
  yield { type: 'thinking', data: { status: 'Loading database schema...' } };
  const schema = await databaseService.getDatabaseSchemaForAI({ userID, tenantID, dbPool });

  // 2. Phase 1: The Plan (Streaming LLM Call)
  yield { type: 'thinking', data: { status: 'Analyzing your request...' } };
  
  let plan = null;
  let planText = "";
  
  for await (const chunk of aiService.generateQueryPlanStream({
    userPrompt: message,
    schemaContext: schema,
    conversationHistory: history,
    readOnlyMode
  })) {
    if (chunk.type === 'chunk') {
      planText += chunk.data;
      yield { type: 'plan_chunk', data: { text: chunk.data } };
    } else if (chunk.type === 'complete') {
      plan = chunk.data;
      yield { type: 'plan_complete', data: plan };
    }
  }

  if (!plan) {
    yield { type: 'error', data: { message: 'Failed to generate query plan' } };
    return;
  }

  Logger.log("info", {
    message: "databaseChatService:processUserRequestStream",
    intent: plan.intent,
    confidence: plan.confidence,
    readOnlyMode
  });

  // FAST EXIT: Normal Chat
  if (plan.intent === "CHAT" || !plan.sql) {
    yield {
      type: 'complete',
      data: {
        type: "response",
        content: [{ type: "markdown", content: plan.conversational_response }],
        metadata: { 
          confidence: plan.confidence, 
          mode: "conversational",
          processingTime: Date.now() - startTime
        }
      }
    };
    return;
  }

  // 3. Check if this is a write query
  const isWriteOp = databaseChatService.isWriteQuery(plan.sql);

  // 3a. Handle WRITE queries in READ-ONLY mode
  if (readOnlyMode && isWriteOp) {
    yield { type: 'thinking', data: { status: 'Analyzing write operation (read-only mode)...' } };

    // Build analysis response without executing the write query
    const responseBlocks = [];

    // Add warning about read-only mode
    responseBlocks.push({
      type: "markdown",
      content: `> ⚠️ **Read-Only Mode Active**\n> The following write operation was analyzed but **not executed**.`
    });

    // Add the conversational response from the plan
    if (plan.conversational_response) {
      responseBlocks.push({ type: "markdown", content: plan.conversational_response });
    }

    // Add the SQL that would be executed
    responseBlocks.push({
      type: "sql",
      content: plan.sql,
      collapsible: false,
      title: "Query (Not Executed)"
    });

    // Try to show affected data by running a SELECT version (if possible)
    // This helps users understand what data would be affected
    if (plan.affected_data_query) {
      try {
        yield { type: 'executing', data: { status: 'Fetching affected data preview...', sql: plan.affected_data_query } };
        const previewResults = await databaseChatService.executeQuery(dbPool, plan.affected_data_query);
        
        if (previewResults.rowCount > 0) {
          responseBlocks.push({
            type: "markdown",
            content: `### 📋 Data that would be affected (${previewResults.rowCount} rows)`
          });
          responseBlocks.push({
            type: "table",
            columns: previewResults.columns,
            rows: previewResults.rows.slice(0, 50), // Limit preview
            rowCount: previewResults.rowCount,
            interactive: true
          });
        }
      } catch (previewErr) {
        Logger.log("warn", {
          message: "databaseChatService:affectedDataPreviewFailed",
          error: previewErr.message
        });
      }
    }

    // Add explanation of what the query would do
    responseBlocks.push({
      type: "markdown",
      content: `### ℹ️ What this query would do\n\n${plan.reasoning || 'This query would modify data in the database.'}`
    });

    // Provide option to switch to full mode
    responseBlocks.push({
      type: "markdown",
      content: `\n---\n💡 **To execute this query**, switch to "Full Access" mode using the toggle in the header.`
    });

    yield {
      type: 'complete',
      data: {
        type: "database_response",
        content: responseBlocks,
        metadata: {
          confidence: plan.confidence,
          processingTime: Date.now() - startTime,
          mode: "read_only_analysis",
          queryNotExecuted: true
        }
      }
    };
    return;
  }

  // 3b. Normal execution path (read queries, or write queries with readOnlyMode=false)
  yield { type: 'executing', data: { status: 'Running query...', sql: plan.sql } };
  
  let queryResults = null;

  try {
    // Only validate for read-only if readOnlyMode is true (already handled write case above)
    if (readOnlyMode) {
      databaseChatService.validateReadOnlyQuery(plan.sql);
    }
    queryResults = await databaseChatService.executeQuery(dbPool, plan.sql);
    yield { type: 'results', data: queryResults };
  } catch (err) {
    yield {
      type: 'complete',
      data: {
        type: "database_response",
        content: [
          { type: "error", content: `Query execution failed: ${err.message}` },
          { type: "sql", content: plan.sql, collapsible: true, title: "Failed Query" }
        ],
        metadata: { processingTime: Date.now() - startTime }
      }
    };
    return;
  }

  // 4. Phase 2: Analysis & Visualization (Streaming - OPTIONAL)
  let analysis = null;

  if (queryResults.rowCount > 0 && queryResults.rowCount < 1000) {
    yield { type: 'thinking', data: { status: 'Generating insights...' } };
    
    for await (const chunk of aiService.analyzeAndVisualizeStream({
      userPrompt: message,
      dataResults: queryResults,
      chartType: plan.suggested_chart_type
    })) {
      if (chunk.type === 'chunk') {
        yield { type: 'analysis_chunk', data: { text: chunk.data } };
      } else if (chunk.type === 'complete') {
        analysis = chunk.data;
      }
    }
  }

  // 5. Construct Final Rich Response
  const responseBlocks = [];

  if (plan.conversational_response) {
    responseBlocks.push({ type: "markdown", content: plan.conversational_response });
  }

  if (queryResults.rowCount === 0) {
    responseBlocks.push({ type: "markdown", content: "**No records found matching your query.**" });
  }

  if (analysis && analysis.insights_markdown) {
    responseBlocks.push({ type: "markdown", content: analysis.insights_markdown });
  }

  if (analysis && analysis.chart_config) {
    const jsx = generateRechartsJSX(analysis.chart_config, queryResults.rows);
    responseBlocks.push({
      type: "chart",
      chartType: analysis.chart_config.type,
      jsx: jsx,
      data: queryResults.rows
    });
  }

  responseBlocks.push({
    type: "table",
    columns: queryResults.columns,
    rows: queryResults.rows,
    rowCount: queryResults.rowCount,
    interactive: true
  });

  responseBlocks.push({
    type: "sql",
    content: plan.sql,
    collapsible: true,
    title: "View SQL Source"
  });

  yield {
    type: 'complete',
    data: {
      type: "database_response",
      content: responseBlocks,
      metadata: {
        confidence: plan.confidence,
        processingTime: Date.now() - startTime,
        tokensSaved: "High"
      }
    }
  };
};

/**
 * HELPER: Generates JSX deterministically based on config.
 * This saves tokens by not asking LLM to write the whole component.
 */
function generateRechartsJSX(config, data) {
  const { type, xAxisKey, dataKeys, colors } = config;

  // Basic template mapping
  let chartComponent = "BarChart";
  let dataComponent = `<Bar dataKey="${dataKeys[0]}" fill="${colors[0] || '#8884d8'}" />`;

  if (type === 'line') {
    chartComponent = "LineChart";
    dataComponent = dataKeys.map((k, i) =>
      `<Line type="monotone" dataKey="${k}" stroke="${colors[i] || '#8884d8'}" />`
    ).join("\n");
  } else if (type === 'area') {
    chartComponent = "AreaChart";
    dataComponent = `<Area type="monotone" dataKey="${dataKeys[0]}" stroke="${colors[0]}" fill="${colors[0]}" />`;
  } else if (type === 'pie') {
    // Pie charts need specific handling for Recharts, usually simplified here
    return `<ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="${dataKeys[0]}" nameKey="${xAxisKey}" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label /></PieChart></ResponsiveContainer>`;
  }

  return `
    <ResponsiveContainer width="100%" height={300}>
      <${chartComponent} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="${xAxisKey}" />
        <YAxis />
        <Tooltip />
        <Legend />
        ${dataComponent}
      </${chartComponent}>
    </ResponsiveContainer>
  `;
}

module.exports = { databaseChatService };