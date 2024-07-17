import { Button, Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";

import { autocompletion } from "@codemirror/autocomplete";
import { QUERY_PLUGINS_MAP } from "../../..";
import { runQueryAPI } from "../../../../../api/queries";
import {
  displayError,
  displaySuccess,
} from "../../../../../utils/notification";
import { VariableQueryResponseRAWTab } from "../VariableQueryResponseRAWTab";
import { VariableQueryResponseSchemaTab } from "../VariableQueryResponseSchemaTab";

export const VariableQueryBuilder = ({ pmQueryID, value, handleChange }) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const {
    isPending: isRunningPGQuery,
    isSuccess: isRunningPGQuerySuccess,
    isError: isRunningPGQueryError,
    error: runPGQueryError,
    mutate: runPGQuery,
    data: pgQueryData,
  } = useMutation({
    mutationFn: ({ raw_query, pm_query_id }) => {
      return runQueryAPI({
        pm_query_type: QUERY_PLUGINS_MAP.POSTGRE_QUERY.value,
        pm_query: { raw_query, pm_query_id },
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess("Query executed successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _runQuery = () => {
    runPGQuery({
      raw_query: value?.raw_query,
      pm_query_id: pmQueryID,
    });
  };

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
    <div className="!flex flex-col justify-start items-stretch w-100 px-3">
      <div className="w-100 ">
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
        <div className="!flex flex-row justify-between items-center w-100 mt-3">
          {pgQueryData && Array.isArray(pgQueryData) ? (
            <span>{`Result : ${pgQueryData.length}`}</span>
          ) : (
            <span></span>
          )}
          <div className="!flex flex-row justify-start items-center">
            <Button
              variant="outlined"
              className="!ml-3"
              onClick={_runQuery}
            >{`Test query`}</Button>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={_handleTabChange}
        style={{
          background: theme.palette.background.paper,
          marginTop: 20,
        }}
      >
        <Tab label="Raw" />
        <Tab label="Data Schema" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
      <div className="py-3 w-100 flex-grow h-full">
        {tab === 0 && (
          <VariableQueryResponseRAWTab data={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 1 && <VariableQueryResponseSchemaTab data={pgQueryData} />}
      </div>
    </div>
  );
};
