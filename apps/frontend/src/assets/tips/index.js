export const query_variable_usage_tip = `
## **Using queries variables**
---------------------------
\\
**Inside Another Query:** Query values can be used in run-time inside another query by utilizing the syntax below:
\`\`\`sql
select * from city where city_id={{[pm_query_id:21][0].city_id]};
\`\`\`
  - \`{{}}\` is used to utilize the variable
  - \`[]\` is used to define the \`pm_query_id\` of desired query

**Inside app constants** (Work in progress!): Currently this functionality is not available
`;
