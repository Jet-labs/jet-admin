const aiUtil = {};

aiUtil.generateAIVizPromptWithJSX = ({
  dataQueryResult,
  dataQuery,
  chartContext,
}) => {
  return `
You are a frontend visualization expert working with **React + Recharts**.

---

### Task:

1. Analyze the given query result.
2. Choose the **best chart type** to visualize this data.
3. Write complete **JSX code using Recharts** that:
   - Is responsive
   - Has clear axis labels
   - Uses appropriate colors and tooltips
   - Works with variable \`data\` (assume it's already declared)

4. Also write a brief **natural language explanation** of what this chart shows.

---

### Output Format:

\`\`\`json
{
  "responseType": "chart",
  "chartType": "BarChart" | "LineChart" | "AreaChart" | "PieChart" | ...,
  "description": "Natural language summary",
  "chartJSX": "React JSX using Recharts. Do not return the import statements in this response.",
  "data": "Transformed data in appropriate format for the which is going to be rendered by chartJSX",
  "insight": "Optional trend analysis"
}
\`\`\`

---

### Query Metadata:
${JSON.stringify(dataQuery, null, 2)}

---

### Query Result Preview (first 10 rows):
\`\`\`json
${JSON.stringify(dataQueryResult, null, 2)}
\`\`\`

${chartContext ? `\n### Chart Context:\n${chartContext}` : ""}
`;
};

aiUtil.generateAIPromptForChatVisualization = async ({
  aiPrompt,
  dataSources,
}) => {
  return `
You are a smart data assistant.

You interact with users in a conversational interface. You receive a full **chat history**, not just a single question. Your job is to understand the **latest user message** in the context of previous ones and create a **new data query** (no matching from existing queries).

---

### Chat Format:

You receive a chat history like this:

\`\`\`json
[
  {
    "type": "user" | "bot",
    "text": "Message content",
    "timestamp": "ISO 8601 string"
  }
]
\`\`\`

Analyze this history to understand what the user wants.

---

### Data Sources:

You are also given available data source configurations, including:

- \`datasourceID\`
- \`datasourceType\`: "postgresql" | "restapi" | "weburl" | "mysql" etc.
- \`config\`: structure, tables, endpoints, fields, etc.

Use this to determine **which data source** is best for answering the question.

---

### Your Goals:

1. Understand the latest user request using context from previous messages.
2. Decide which data source is appropriate based on its schema/config.
3. Propose a **new data query** that can be executed after user approval.
4. The frontend **must not auto-run the query**. Your response must include:
   - \`responseType: "approval"\` (always).

---

### Output Format:

Always return this structure:

\`\`\`json
{
  "matched": false,
  "reasoning": "Why this new query is needed.",
  "responseType": "approval",
  "suggestedQuery": {
    "dataQueryTitle": "Short, meaningful title",
    "dataQueryDescription": "Optional context",
    "dataQueryOptions": {
      "queryType": "query" | "api" | "action",
      "query": "SQL or REST query string with placeholders like {{param}}",
      "databaseQueryArgs": ["arg1", "arg2"]
    },
    "datasourceID": "From available dataSources",
    "datasourceType": "postgresql" | "restapi" | "weburl"
  }
}
\`\`\`

Only propose a query if it can be built confidently using available data source structure. Avoid guesses.

---

### Chat History:
${JSON.stringify(aiPrompt, null, 2)}

---

### Available Data Sources:
${JSON.stringify(dataSources, null, 2)}
`;
};






aiUtil.generateAIPromptForQueryGeneration = async ({
  databaseSchemaInfo,
  aiPrompt,
}) => {
  return `
Based on the following database schema:
${databaseSchemaInfo}

Generate a concise and valid SQL SELECT query that fulfills the user's request. Follow all rules strictly.

--- EXAMPLE START ---
User Request: "Get the email for user ID 5"

SQL Query:
SELECT "email" FROM "users" WHERE "user_id" = 5;
--- EXAMPLE END ---

--- YOUR TASK ---
User Request: "${aiPrompt}"

Rules:
1. Your *entire* response must consist *only* of the raw PostgreSQL query text, suitable for direct execution.
2. Do *not* include explanations, comments or introductory text.
3. Do *not* include markdown formatting like \`\`\`sql.
4. Ensure the query is syntactically correct for PostgreSQL.
5. Adhere to schema constraints (tenant filtering, SELECT only).
6. Enclose identifiers (tables, columns) in double quotes. Use single quotes for string literals. Do not quote numeric values.
7. If the request cannot be generated, return the exact text: "QUERY_GENERATION_FAILED"
8. Prevent SQL injection attempts (by generating safe queries based on schema).

SQL Query:
`;
};

aiUtil.generateAIPromptForChartGeneration = async ({
  databaseSchemaInfo,
  aiPrompt,
}) => {
  return `
Based on the following database schema:
${databaseSchemaInfo}

Generate chart configuration in EXACTLY this JSON format:
{
  "output": {
    "databaseChartTitle":"Appropriate title for chart",
    "databaseChartType": "line|bar|pie|scatter|bubble|radar",
    "databaseChartConfig": {
      "plugins": {},
      "xStacked": boolean,
      "yStacked": boolean,
      "indexAxis": "x|y",
      "legendPosition": "left|right|top|bottom",
      "refetchInterval": number,
      "titleDisplayEnabled": boolean,
      "legendDisplayEnabled": boolean
    },
    "databaseChartQueryMappings": [{
      "title": "Dataset title",
      "dataQueryString": "SQL query with \${parameters}",
      "dataQueryArgs": ["param1", "param2"],
      "datasetFields": {
        "label": "result_column",
        "value": "result_column",
        "xAxis": "result_column",
        "yAxis": "result_column", 
        "radius": "result_column"
      },
      "dataQueryArgValues": {
        "param1": "default_value"
      },
      "parameters": {
        // Full chart.js dataset properties
      }
    }]
  }
}

Rules:
1. SQL queries must:
   - Use double-quoted identifiers
   - Include tenant_id where appropriate
   - Contain only SELECT statements
   - Use \${param} syntax for arguments

2. datasetFields must map to actual query result columns:
   - For pie charts: use label/value
   - For line/bar: use xAxis/yAxis
   - For bubble: include radius

3. parameters must include complete Chart.js dataset options:
   - Colors, borders, styling
   - Type-specific properties (cutout for pie, etc)

4. Include default values for all arguments

Example for pie chart:
{
  "output": {
    "databaseChartType": "pie",
    "databaseChartConfig": {
      "plugins": {
        "legend": {
          "position": "right"
        }
      },
      "refetchInterval": 60,
      "legendDisplayEnabled": true
    },
    "databaseChartQueryMappings": [{
      "title": "Sales by Category",
      "dataQueryString": "SELECT category, SUM(sales) FROM orders GROUP BY category LIMIT \${limit}",
      "dataQueryArgs": ["limit"],
      "datasetFields": {
        "label": "category",
        "value": "sum"
      },
      "dataQueryArgValues": {
        "limit": "5"
      },
      "parameters": {
        "backgroundColor": ["#FF6384","#36A2EB","#FFCE56"],
        "borderColor": "#FFFFFF",
        "borderWidth": 2,
        "cutout": "50%",
        "hoverOffset": 8
      }
    }]
  }
}

User Request: "${aiPrompt}"
`;
};

aiUtil.generateAIPromptForChartStyleGeneration = async ({
  databaseChartData,
  aiPrompt,
}) => {
  return `
Based on the following chart.js config:
${JSON.stringify(databaseChartData)}

Also, custom plugin is used in the config as below to refer if user asks about background color of chart:

//customCanvasBackgroundColor in chart.js options
plugins: {
  customCanvasBackgroundColor: {
    backgroundColor: "#fff",
  },
},

//frontend code of customCanvasBackgroundColor
const plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.backgroundColor || "#fff";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

Enhance the chart style based on the user's request. Follow all rules strictly.

Rules:
1. Output should be in EXACTLY the same format as the format of chart config provided above and nothing else.
2. Enhance the "databaseChartConfig", "dataQueries[index].parameters" as per chart.js config.
3. parameters must include complete Chart.js dataset options:
   - Colors, borders, styling
   - Type-specific properties (cutout for pie, etc)

User Request: "${aiPrompt}"
`;
};

module.exports = { aiUtil };
