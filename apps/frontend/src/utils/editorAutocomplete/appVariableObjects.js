import { languages } from "monaco-editor";
import { AppVariable } from "../../models/data/appVariable";

/**
 *
 * @param {Array<AppVariable>} appVariables
 */
export const getAppVariableObjectSuggestions = (appVariables, range) => {
  const suggestions = [];
  appVariables?.forEach((appVariable) => {
    suggestions.push({
      label: appVariable.pm_app_variable_title,
      kind: languages.CompletionItemKind.Variable,
      documentation: {
        value: `### **${
          appVariable.pm_app_variable_title
        }**\n\n\`\`\`json\n${JSON.stringify(
          appVariable.pm_app_variable_value,
          null,
          2
        )}\n\`\`\``,
      },
      insertText: `[pm_app_variable_id:${appVariable.pm_app_variable_id}]`, // Insert model name followed by a dot
      range: range,
    });
    suggestions.push({
      label: `[pm_app_variable_id:${appVariable.pm_app_variable_id}]`,
      kind: languages.CompletionItemKind.Variable,
      documentation: {
        value: `### **${
          appVariable.pm_app_variable_title
        }**\n\n\`\`\`json\n${JSON.stringify(
          appVariable.pm_app_variable_value,
          null,
          2
        )}\n\`\`\``,
      },
      insertText: `[pm_app_variable_id:${appVariable.pm_app_variable_id}]`, // Insert model name followed by a dot
      range: range,
    });
  });
  return suggestions;
};
