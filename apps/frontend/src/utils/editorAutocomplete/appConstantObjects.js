import { languages } from "monaco-editor";
import { AppConstant } from "../../models/data/appConstant";

/**
 *
 * @param {Array<AppConstant>} appConstants
 */
export const getAppConstantObjectSuggestions = (appConstants, range) => {
  const suggestions = [];
  appConstants?.forEach((appConstant) => {
    suggestions.push({
      label: appConstant.pm_app_constant_title,
      kind: languages.CompletionItemKind.Variable,
      documentation: {
        value: `### **${
          appConstant.pm_app_constant_title
        }**\n\n\`\`\`json\n${JSON.stringify(
          appConstant.pm_app_constant_value,
          null,
          2
        )}\n\`\`\``,
      },
      insertText: `[pm_app_constant_id:${appConstant.pm_app_constant_id}]`, // Insert model name followed by a dot
      range: range,
    });
    suggestions.push({
      label: `[pm_app_constant_id:${appConstant.pm_app_constant_id}]`,
      kind: languages.CompletionItemKind.Variable,
      documentation: {
        value: `### **${
          appConstant.pm_app_constant_title
        }**\n\n\`\`\`json\n${JSON.stringify(
          appConstant.pm_app_constant_value,
          null,
          2
        )}\n\`\`\``,
      },
      insertText: `[pm_app_constant_id:${appConstant.pm_app_constant_id}]`, // Insert model name followed by a dot
      range: range,
    });
  });
  return suggestions;
};
