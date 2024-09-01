import React, { useCallback } from "react";
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
import { getAllTableColumns, getAllTables } from "../../../../api/tables";

/**
 *
 * @param {Array} tables
 * @returns
 */
const getModelSuggestions = (tables, range) => {
  if (tables) {
    const suggestions = tables.map((table) => ({
      label: table,
      kind: languages.CompletionItemKind.Variable,
      documentation: `Table ${table}`,
      insertText: `${table}.`,
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

/**
 *
 * @param {Array} tableColumns
 * @returns
 */
const getFieldSuggestions = (tableColumns, modelName, range) => {
  const currentModelFields = modelName
    ? tableColumns?.filter((column) => column.tableName == modelName)
    : tableColumns;
  console.log({ currentModelFields });
  if (currentModelFields) {
    return currentModelFields.map((column) => ({
      label: column.name,
      kind: languages.CompletionItemKind.Property,
      documentation: `Field in model ${column.name}`,
      insertText: column.name,
      range: range,
    }));
  }

  return [];
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

  const {
    isLoading: isLoadingTables,
    data: tables,
    error: loadTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLES],
    queryFn: () => getAllTables(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  const {
    isLoading: isLoadingTableColumns,
    data: tableColumns,
    error: loadTableColumnsError,
    refetch: refetchTableColumns,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_COLUMNS],
    queryFn: () => getAllTableColumns(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });
  console.log({ tableColumns });

  const handleEditorWillMount = useCallback(
    (monaco) => {
      // Register model suggestions separately
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
            const modelSuggestions = getModelSuggestions(tables, range);
            const fieldSuggestions = getFieldSuggestions(
              tableColumns,
              null,
              range
            );
            console.log({ fieldSuggestions });
            // General PostgreSQL suggestions
            const pgSuggestions = getPostgreSQLSuggestions(range);
            suggestions = [
              ...pgSuggestions,
              ...modelSuggestions,
              ...fieldSuggestions,
            ];
          }
          return { suggestions };
        },
      });

      monaco.languages.registerHoverProvider("pgsql", {
        provideHover: function (model, position) {
          const word = model.getWordAtPosition(position);

          if (word) {
            const table = tables?.find((m) => m === word.word);
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
    },
    [tables, tableColumns]
  );

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
