import React from "react";
import Editor from "@monaco-editor/react";
import { useAppConstants } from "../../../../contexts/appConstantsContext";
import { useThemeValue } from "../../../../contexts/themeContext";
import { DEFAULT_PG_KEYWORDS } from "../../../../utils/editorAutocomplete/pgKeywords";
import { useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAllQueryAPI } from "../../../../api/queries";
import { languages } from "monaco-editor";
import { getQueryObjectSuggestions } from "../../../../utils/editorAutocomplete/queryObjects";
import { LOCAL_CONSTANTS } from "../../../../constants";
import { getAppConstantObjectSuggestions } from "../../../../utils/editorAutocomplete/appConstantObjects";

/**
 *
 * @param {Array} dbModel
 * @returns
 */
const getModelSuggestions = (dbModel, range) => {
  if (dbModel) {
    const suggestions = dbModel.map((model) => ({
      label: model.name,
      kind: languages.CompletionItemKind.Variable,
      documentation: `Table ${model.name}`,
      insertText: `${model.name}.`,
      range: range,
      command: {
        id: "editor.action.triggerSuggest",
      },
    }));
    return suggestions;
  } else {
    return [];
  }
};

const getPostgreSQLSuggestions = (range) => {
  return DEFAULT_PG_KEYWORDS.map((key) => ({
    label: key,
    kind: languages.CompletionItemKind.Keyword,
    insertText: key,
    range: range,
  }));
};
export const PGSQLQueryEditor = ({ value, handleChange }) => {
  const { dbModel } = useAppConstants();
  const { themeType } = useThemeValue();
  const theme = useTheme();
  const { appConstants } = useAppConstants();

  const {
    isLoading: isLoadingQueries,
    data: queries,
    error: loadQueriesError,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES],
    queryFn: () => getAllQueryAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const handleEditorWillMount = (monaco) => {
    monaco.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: wordInfo.endColumn,
        });

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };

        let suggestions = [];
        // Check if the cursor is inside {{ }}
        const isInsideBraces =
          textBeforeCursor.includes("{{") && !textBeforeCursor.includes("}}");

        if (isInsideBraces && queries) {
          // Provide suggestions specific to the context inside {{ }}
          suggestions = [
            ...getQueryObjectSuggestions(queries, range),
            ...getAppConstantObjectSuggestions(appConstants, range),
          ];
        } else {
          // Model suggestions with nested field suggestions
          const modelSuggestions = getModelSuggestions(dbModel, range);
          // General PostgreSQL suggestions
          const pgSuggestions = getPostgreSQLSuggestions(range);
          suggestions = [...pgSuggestions, ...modelSuggestions];
        }
        return { suggestions };
      },
    });

    // Register field suggestions separately
    monaco.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        };

        const modelName = textUntilPosition.split(".")[0];
        const currentModel = dbModel?.find((m) => m.name === modelName);

        if (currentModel) {
          return {
            suggestions: currentModel.fields.map((field) => ({
              label: field.name,
              kind: monaco.languages.CompletionItemKind[
                field.kind === "object" ? "Class" : "Property"
              ],
              documentation: `Field in model ${currentModel.name}`,
              insertText: field.name,
              range: range,
            })),
          };
        }

        return { suggestions: [] };
      },
    });

    monaco.languages.registerHoverProvider("pgsql", {
      provideHover: function (model, position) {
        const word = model.getWordAtPosition(position);

        if (word) {
          const table = dbModel?.find((m) => m.name === word.word);
          const field = dbModel?.flatMap((m) =>
            m.fields.filter((f) => f.name === word.word)
          )[0];

          let hoverMessage = null;

          if (table) {
            const fields = table?.fields?.map((f) => {
              return { value: `${f.name}: ${f.type}` };
            });
            hoverMessage = {
              contents: [
                { value: `**Table**: ${table.name}` },
                { value: `**Fields**` },
                ...fields,
              ],
            };
          }

          if (hoverMessage) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: hoverMessage.contents,
            };
          }
        }

        return null;
      },
    });
  };

  const handleEditorChange = (newValue) => {
    handleChange({ raw_query: newValue });
  };

  return (
    <div
      className="!mt-3"
      style={{
        borderRadius: 4,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      }}
    >
      <Editor
        height="200px"
        defaultLanguage="pgsql"
        theme={themeType === "dark" ? "vs-dark" : "vs-light"}
        beforeMount={handleEditorWillMount} // Register custom suggestions before the editor mounts
        onChange={handleEditorChange}
        value={value ? value.raw_query : ""}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};
