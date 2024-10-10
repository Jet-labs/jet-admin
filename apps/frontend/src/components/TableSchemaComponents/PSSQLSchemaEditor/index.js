import { Button, Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { default as React, useState } from "react";
import "react-data-grid/lib/styles.css";

import { getSchemaAPI, runSchemaQueryAPI } from "../../../api/schemas";

import { displayError, displaySuccess } from "../../../utils/notification";
import { PGSQLQueryResponseRAWTab } from "../../QueryComponents/QueryBuilderComponents/PGSQLQueryResponseRAWTab";
import { PGSQLQueryResponseSchemaTab } from "../../QueryComponents/QueryBuilderComponents/PGSQLQueryResponseSchemaTab";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";

import { useThemeValue } from "../../../contexts/themeContext";
import { CodeEditor } from "../../CodeEditorComponent";
import { PGSQLQueryResponseJSONTab } from "../../QueryComponents/QueryBuilderComponents/PGSQLQueryResponseJSONTab";

export const PGSQLSchemaBuilder = ({}) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  const [tab, setTab] = React.useState(0);
  const [rawQuery, setRawQuery] = useState("");

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const {
    isLoading: isLoadingSchema,
    data: schemaData,
    error: loadSchemaError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_TABLE_SCHEMA`],
    queryFn: () => getSchemaAPI(),
    cacheTime: 0,
    retry: 1,
  });

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
      direction="horizontal"
      autoSaveId="pg-schema-update-form-panel-sizes"
      className="!flex flex-col justify-start items-stretch w-100"
    >
      <ResizablePanel
        defaultSize={50}
        style={{
          borderRightWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId="pg-schema-query-builder-form-panel-sizes"
          className="!flex flex-col justify-start items-stretch w-100"
        >
          <ResizablePanel defaultSize={40} className="px-3">
            <div className="w-100 flex-col justify-start items-center py-3">
              <CodeMirror
                value={rawQuery}
                height="200px"
                extensions={[loadLanguage("pgsql")]}
                onChange={setRawQuery}
                theme={themeType == "dark" ? vscodeDark : githubLight}
                style={{
                  // marginTop: 20,
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
            // className="px-3"
          >
            <Tabs
              value={tab}
              onChange={_handleTabChange}
              style={{
                background: theme.palette.background.paper,
                // marginTop: 20,
              }}
            >
              <Tab label="JSON" />
              <Tab label="Raw" />
              <Tab label="Data Schema" />
            </Tabs>
            <Divider style={{ width: "100%" }} />
            <div className="py-3 w-100 flex-grow h-full px-3">
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
              {tab === 2 && (
                <PGSQLQueryResponseSchemaTab data={schemaQueryData} />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={50} className="!overflow-y-scroll">
        <div className="!w-full !p-1 !pt-2 !px-3">
          <span className="!font-semibold !text-sm">Exising schema</span>
        </div>

        <CodeEditor
          code={schemaData}
          readOnly={true}
          language="pgsql"
          rounded={false}
          outlined={false}
          height="100%"
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
