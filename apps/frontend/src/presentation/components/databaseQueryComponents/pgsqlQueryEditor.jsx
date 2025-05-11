import React, { useEffect, useMemo, useRef } from "react";
import Editor from "@monaco-editor/react";
import CloudTheme from "monaco-themes/themes/Clouds.json";
import Github from "monaco-themes/themes/GitHub Light.json"
import { useDatabaseQueriesState } from "../../../logic/contexts/databaseQueriesContext";

export const PGSQLQueryEditor = ({
  readOnly,
  code,
  setCode,
  height = "200px",
  language = "sql",
  rounded = true,
  outlined = true,
}) => {
  const { databaseMetadata } = useDatabaseQueriesState();

  // Create schema {tableName: [columns]}
  const schema = useMemo(() => {
    if (!databaseMetadata || !databaseMetadata.schemas) return {};

    const tablesMap = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      if (schemaItem.tables) {
        schemaItem.tables.forEach((table) => {
          const tableName = table.databaseTableName;
          const columns = (table.databaseTableColumns || []).map(
            (col) => col.databaseTableColumnName
          );
          tablesMap[tableName] = columns;
        });
      }
    });
    console.log("Schema created:", tablesMap); // For debugging
    return tablesMap;
  }, [databaseMetadata]);

  // Ref to hold the latest schema for the completion provider
  const schemaRef = useRef(schema);
  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  const handleEditorWillMount = (monaco) => {
    // It's good practice to dispose of existing providers if you were to re-register,
    // but with beforeMount, this typically runs once.
    // For this example, we'll assume a single registration.
    // If you had a scenario requiring re-registration, you'd do:
    // if (window.myPgsqlCompletionProvider) {
    //   window.myPgsqlCompletionProvider.dispose();
    // }
    // window.myPgsqlCompletionProvider = monaco.languages.registerCompletionItemProvider(...)

    monaco.languages.registerCompletionItemProvider(language, { // Use the language prop
      triggerCharacters: ['.', ' '], // Trigger on dot and space
      provideCompletionItems: (model, position, context) => {
        // Access the latest schema via the ref
        const currentSchema = schemaRef.current;
        const suggestions = [];

        // Determine the word at the current position to define the replacement range
        const wordInfo = model.getWordUntilPosition(position);
        const defaultSuggestionRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };

        // Get all text in the editor up to the current cursor position
        // This helps in identifying context like "tableName."
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Regex to find if the text ends with "word." (e.g., "users.")
        // \b ensures it matches a whole word.
        const tableNameMatch = textUntilPosition.match(/(\b\w+)\.$/);

        if (tableNameMatch && tableNameMatch[1]) {
          // Context: User typed "tableName." -> suggest columns
          const tableName = tableNameMatch[1];
          if (currentSchema && currentSchema[tableName]) {
            const columns = currentSchema[tableName];
            columns.forEach((colName) => {
              suggestions.push({
                label: colName,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: colName,
                detail: `Column of ${tableName}`,
                range: defaultSuggestionRange, // Monaco will replace the typed part or insert
              });
            });
          }
        } else {
          // Context: User typed a space or is invoking suggestions (Ctrl+Space)
          // Suggest table names and SQL keywords

          // Suggest table names
          if (currentSchema) {
            Object.keys(currentSchema).forEach((tableName) => {
              suggestions.push({
                label: tableName,
                kind: monaco.languages.CompletionItemKind.Class, // Using Class for tables
                insertText: tableName,
                detail: "Table",
                range: defaultSuggestionRange,
              });
            });
          }

          // Suggest basic SQL keywords
          const sqlKeywords = [
            "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON",
            "GROUP BY", "ORDER BY", "ASC", "DESC", "AS", "DISTINCT", "LIMIT", "OFFSET",
            "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE",
            "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "INDEX",
            "COUNT", "SUM", "AVG", "MAX", "MIN", "AND", "OR", "NOT", "NULL", "IS"
            // Add more keywords as needed
          ];

          sqlKeywords.forEach((keyword) => {
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range: defaultSuggestionRange,
            });
          });
        }
        
        // console.log("Providing suggestions:", suggestions.length > 0 ? suggestions : "None for context"); // For debugging
        return { suggestions: suggestions };
      },
    });
    monaco.editor.defineTheme('jet-theme', Github);
  };

  return (
    <div
      className={`${rounded ? "rounded-sm" : ""} ${outlined ? "border border-slate-200" : ""} overflow-hidden min-w-[300px]`}
      
    >
      <Editor
        height={height}
        defaultLanguage={language} // Use language prop
        value={code}
        onChange={(value) => setCode(value || "")}
        beforeMount={handleEditorWillMount} // Critical: called once before editor mounts
        options={{
          readOnly: readOnly,
          fontSize: 12,
          minimap: { enabled: false },
          lineNumbers: "on",
          lineNumbersMinChars: 2,
          folding: false,
          // quickSuggestions: true, // Simplified: true enables default quick suggestions
          quickSuggestions: { other: true, comments: false, strings: true }, // from original
          suggestOnTriggerCharacters: true, // Enable suggestions on trigger characters
          wordBasedSuggestions: true, // Enable default word-based suggestions
          // Ensure suggestions pop up automatically
          suggest: {
            // Show suggestions automatically as you type
            snippetsPreventQuickSuggestions: false,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showFolders: true,
            showSnippets: true,
          },
        }}
        theme='jet-theme' // Monaco's default light theme
      />
    </div>
  );
};
