import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";

import { autocompletion } from "@codemirror/autocomplete";

export const PGSQLQueryEditor = ({ value, handleChange }) => {
  const theme = useTheme();

  const _handleOnRAWQueryChange = (value) => {
    handleChange({ raw_query: value });
  };

  const sqlSuggestions = [
    {
      label: "variable1",
      type: "variable",
      properties: [
        {
          label: "property1",
          type: "property",
          properties: [
            { label: "subProperty1", type: "property" },
            { label: "subProperty2", type: "property" },
          ],
          functions: [
            { label: "function1", type: "function" },
            { label: "function2", type: "function" },
          ],
        },
        { label: "property2", type: "property" },
      ],
      functions: [
        { label: "function1", type: "function" },
        { label: "function2", type: "function" },
      ],
    },
    {
      label: "variable2",
      type: "variable",
      properties: [
        {
          label: "propertyA",
          type: "property",
          properties: [
            { label: "subPropertyA1", type: "property" },
            { label: "subPropertyA2", type: "property" },
          ],
          functions: [
            { label: "functionA1", type: "function" },
            { label: "functionA2", type: "function" },
          ],
        },
        { label: "propertyB", type: "property" },
      ],
      functions: [
        { label: "functionA", type: "function" },
        { label: "functionB", type: "function" },
      ],
    },
    // Add more variables with nested properties and functions
  ];

  const getNestedSuggestions = (context, suggestions, fromIndex) => {
    const word = context.matchBefore(/\.\w*/);
    if (word && word.from !== word.to) {
      const nestedWord = word.text.slice(1); // Remove leading dot
      const path = context.state.sliceDoc(fromIndex, word.from).split(".");

      let currentLevel = suggestions.find(
        (suggestion) => suggestion.label === path[0]
      );

      for (let i = 1; i < path.length; i++) {
        if (currentLevel && currentLevel.properties) {
          currentLevel = currentLevel.properties.find(
            (p) => p.label === path[i]
          );
        } else {
          return null;
        }
      }

      if (currentLevel) {
        const options = [
          ...(currentLevel.properties || []),
          ...(currentLevel.functions || []),
        ].filter((suggestion) => suggestion.label.startsWith(nestedWord));

        return {
          from: word.from + 1, // +1 to skip the leading dot
          options: options.map((suggestion) => ({
            label: suggestion.label,
            type: suggestion.type,
          })),
        };
      }
    }
    return null;
  };

  // Autocomplete logic
  const customAutocomplete = autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/\{\{\w*/);
        if (word && word.from !== word.to) {
          const variableName = word.text.slice(2); // Remove leading {{
          console.log({ variableName });
          const variable = sqlSuggestions.find((suggestion) =>
            suggestion.label.startsWith(variableName)
          );
          console.log({ variable });
          if (variable) {
            const nestedSuggestions = getNestedSuggestions(
              context,
              sqlSuggestions,
              word.from + 2
            );
            if (nestedSuggestions) {
              return nestedSuggestions;
            }
            const options = [
              ...(variable.properties || []),
              ...(variable.functions || []),
            ].map((suggestion) => ({
              label: suggestion.label,
              type: suggestion.type,
            }));
            return {
              from: word.from + 2, // +2 to skip the opening {{
              options: options,
            };
          }
        } else {
          const rootWord = context.matchBefore(/\{\{\w*/);
          if (rootWord && rootWord.from !== rootWord.to) {
            const variableName = rootWord.text.slice(2); // Remove leading {{
            const options = sqlSuggestions
              .filter((suggestion) => suggestion.label.startsWith(variableName))
              .map((suggestion) => ({
                label: suggestion.label,
                type: suggestion.type,
              }));
            return {
              from: rootWord.from + 2, // +2 to skip the opening {{
              options: options,
            };
          }
        }
        return null;
      },
    ],
  });

  return (
    <CodeMirror
      value={value ? value.raw_query : ""}
      height="200px"
      extensions={[loadLanguage("pgsql"), customAutocomplete]}
      onChange={_handleOnRAWQueryChange}
      theme={githubLight}
      style={{
        marginTop: 20,
        width: "100%",
        borderWidth: 1,
        borderColor: theme.palette.divider,
        borderRadius: 4,
      }}
      className="codemirror-editor-rounded"
    />
  );
};
