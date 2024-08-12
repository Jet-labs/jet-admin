import React, { useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useAppConstants } from "../../../../../contexts/appConstantsContext";
import { useThemeValue } from "../../../../../contexts/themeContext";
import { DEFAULT_PG_KEYWORDS } from "../../../../../utils/pgKeywords";
import { useTheme } from "@mui/material";
import "./styles.css";
export const PGSQLQueryEditor = ({ value, handleChange }) => {
  const { dbModel } = useAppConstants();
  const { themeType } = useThemeValue();
  const theme = useTheme();

  const handleEditorWillMount = (monaco) => {
    // Register custom completion provider
    monaco.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };

        const modelSuggestions = dbModel?.map((model) => ({
          label: model.name,
          kind: monaco.languages.CompletionItemKind.Variable,
          documentation: `Table ${model.name}`,
          insertText: model.name,
          range: range,
        }));

        const fieldSuggestions = dbModel?.flatMap((model) =>
          model.fields.map((field) => ({
            label: `${model.name}.${field.name}`,
            kind: monaco.languages.CompletionItemKind[
              field.kind === "object" ? "Class" : "Property"
            ],
            documentation: `Field in model ${model.name}`,
            insertText: `${model.name}.${field.name}`,
            range: range,
          }))
        );

        const pgSuggestions = DEFAULT_PG_KEYWORDS.map((key) => ({
          label: key,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: key,
          range: range,
        }));

        return {
          suggestions: [
            ...pgSuggestions,
            ...modelSuggestions,
            ...fieldSuggestions,
          ],
        };
      },
    });

    monaco.languages.registerHoverProvider("pgsql", {
      provideHover: function (model, position) {
        const word = model.getWordAtPosition(position);

        if (word) {
          // Here you can add more complex logic to provide hover information
          const table = dbModel?.find((m) => m.name === word.word);
          const field = dbModel?.flatMap((m) =>
            m.fields.filter((f) => f.name === word.word)
          )[0];

          let hoverMessage = null;

          if (table) {
            const _c = table?.fields?.map((f) => {
              return { value: `${f.name}: ${f.type}` };
            });
            hoverMessage = {
              contents: [
                { value: `**Table**: ${table.name}` },
                { value: `**Fields**` },
                ..._c,
              ],
            };
            // } else if (field) {
            //   hoverMessage = {
            //     contents: [
            //       { value: `**Field**: ${field.name}` },
            //       { value: `Type: ${field.type}` }, // If modelName is part of field data
            //     ],
            //   };
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
        // defaultValue={value ? value.raw_query : ""}
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
