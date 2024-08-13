import { languages } from "monaco-editor";
import { Query } from "../../models/data/query";

/**
 *
 * @param {Array<Query>} queries
 */
export const getQueryObjectSuggestions = (queries, range) => {
  const suggestions = [];
  queries?.forEach((query) => {
    suggestions.push({
      label: query.pm_query_title,
      kind: languages.CompletionItemKind.Variable,
      documentation: {
        value: `### **${query.pm_query_title}**\n\n\`\`\`sql\n${query.pm_query?.raw_query}\n\`\`\``,
      },
      insertText: `[pm_query_id:${query.pm_query_id}]`, // Insert model name followed by a dot
      range: range,
    });
    suggestions.push({
      label: `[pm_query_id:${query.pm_query_id}]`,
      kind: languages.CompletionItemKind.Variable,

      documentation: {
        value: `### **${query.pm_query_title}**\n\n\`\`\`sql\n${query.pm_query?.raw_query}\n\`\`\``,
      },
      insertText: `[pm_query_id:${query.pm_query_id}]`, // Insert model name followed by a dot
      range: range,
    });
    if (query.pm_query.raw_query) {
      suggestions.push({
        label: query.pm_query.raw_query,
        kind: languages.CompletionItemKind.Variable,
        documentation: {
          value: `### **${query.pm_query_title}**\n\n\`\`\`sql\n${query.pm_query?.raw_query}\n\`\`\``,
        },
        insertText: `[pm_query_id:${query.pm_query_id}]`, // Insert model name followed by a dot
        range: range,
      });
    }
  });
  return suggestions;
};
