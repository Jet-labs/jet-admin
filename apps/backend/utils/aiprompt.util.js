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

module.exports = {aiUtil};
