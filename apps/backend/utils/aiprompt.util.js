const aiUtil = {};

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
    "databaseChartType": "line|bar|pie|scatter|bubble|radar|radial",
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
      "databaseQueryString": "SQL query with \${parameters}",
      "databaseQueryArgs": ["param1", "param2"],
      "datasetFields": {
        "label": "result_column",
        "value": "result_column",
        "xAxis": "result_column",
        "yAxis": "result_column", 
        "radius": "result_column"
      },
      "databaseQueryArgValues": {
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
      "databaseQueryString": "SELECT category, SUM(sales) FROM orders GROUP BY category LIMIT \${limit}",
      "databaseQueryArgs": ["limit"],
      "datasetFields": {
        "label": "category",
        "value": "sum"
      },
      "databaseQueryArgValues": {
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
Based on the following chart config:
${JSON.stringify(databaseChartData)}

Enhance the chart style based on the user's request. Follow all rules strictly.

Rules:
1. Output should be in EXACTLY the same format as the format of chart config provided above and nothing else.
2. Enhance the "databaseChartConfig", "databaseQueries[index].parameters" as per chart.js config.
3. parameters must include complete Chart.js dataset options:
   - Colors, borders, styling
   - Type-specific properties (cutout for pie, etc)

User Request: "${aiPrompt}"
`;
};

module.exports = { aiUtil };
