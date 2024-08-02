import { Button, Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { default as React, useState } from "react";
import "react-data-grid/lib/styles.css";

import { runSchemaQueryAPI } from "../../../api/tables";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
import { displayError, displaySuccess } from "../../../utils/notification";
import { PGSQLQueryResponseSchemaTab } from "../../../plugins/queries/postgresql/components/PGSQLQueryResponseSchemaTab";
import { PGSQLQueryResponseRAWTab } from "../../../plugins/queries/postgresql/components/PGSQLQueryResponseRAWTab";
import { PGSQLQueryResponseJSONTab } from "../../../plugins/queries/postgresql/components/PGSQLQueryResponseJSONTab";
import { useThemeValue } from "../../../contexts/themeContext";

export const PGSQLSchemaBuilder = ({}) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  const [tab, setTab] = React.useState(0);
  const [rawQuery, setRawQuery] = useState("");

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const {
    isPending: isRunningSchemaQuery,
    isSuccess: isRunningSchemaQuerySuccess,
    isError: isRunningSchemaQueryError,
    error: runSchemaQueryError,
    mutate: runSchemaQuery,
    data: schemaQueryData,
  } = useMutation({
    mutationFn: ({ raw_query }) => {
      return runSchemaQueryAPI({
        schemaQuery: { raw_query },
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess("Schema executed successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _runSchemaQuery = () => {
    runSchemaQuery({
      raw_query: rawQuery,
    });
  };

  return (
    <ResizablePanelGroup
      direction="vertical"
      autoSaveId="pg-query-builder-form-panel-sizes"
      className="!flex flex-col justify-start items-stretch w-100"
    >
      <ResizablePanel defaultSize={40} className="px-3">
        <div className="w-100 ">
          <CodeMirror
            value={rawQuery}
            height="200px"
            extensions={[loadLanguage("pgsql")]}
            onChange={setRawQuery}
            theme={themeType == "dark" ? vscodeDark : githubLight}
            style={{
              marginTop: 20,
              width: "100%",
              borderWidth: 1,
              borderColor: theme.palette.divider,
              borderRadius: 4,
            }}
            className="codemirror-editor-rounded"
          />
        </div>
        <div className="!flex flex-row justify-between items-center w-100 mt-3">
          {schemaQueryData && Array.isArray(schemaQueryData) ? (
            <span>{`Result : ${schemaQueryData.length}`}</span>
          ) : (
            <span></span>
          )}

          <div className="!flex flex-row justify-start items-center">
            <Button
              variant="outlined"
              className="!ml-3"
              onClick={_runSchemaQuery}
            >{`Run query`}</Button>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel
        defaultSize={60}
        style={{ borderTopWidth: 1, borderColor: theme.palette.divider }}
        className="px-3"
      >
        <Tabs
          value={tab}
          onChange={_handleTabChange}
          style={{
            background: theme.palette.background.paper,
            marginTop: 20,
          }}
        >
          <Tab label="JSON" />
          <Tab label="Raw" />
          <Tab label="Data Schema" />
        </Tabs>
        <Divider style={{ width: "100%" }} />
        <div className="py-3 w-100 flex-grow h-full">
          {tab === 0 && (
            <PGSQLQueryResponseJSONTab
              data={schemaQueryData ? schemaQueryData : ""}
            />
          )}
          {tab === 1 && (
            <PGSQLQueryResponseRAWTab
              data={schemaQueryData ? schemaQueryData : ""}
            />
          )}
          {tab === 2 && <PGSQLQueryResponseSchemaTab data={schemaQueryData} />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
