import { Button, Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React, { useState } from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { runQueryAPI } from "../../../../api/queries";
import { displayError, displaySuccess } from "../../../../utils/notification";
import { RESTAPIQueryResponseJSONTab } from "../RESTAPIQueryResponseJSONTab";
import { RESTAPIQueryResponseRAWTab } from "../RESTAPIQueryResponseRAWTab";
import { RESTAPIQueryResponseSchemaTab } from "../RESTAPIQueryResponseSchemaTab";
import { RESTAPIQueryResponseTableTab } from "../RESTAPIQueryResponseTableTab";

export const RESTAPIQueryBuilder = ({ value, handleChange }) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [dataSchema, setDataSchema] = useState();

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
    mutationFn: ({ raw_query }) => {
      return runQueryAPI({ pm_query: { raw_query } });
    },
    retry: false,
    onSuccess: (data) => {
      setDataSchema(jsonSchemaGenerator(Array.isArray(data) ? data[0] : data));
      displaySuccess("Query executed successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _runQuery = () => {
    runPGQuery({ raw_query: value?.raw_query });
  };

  const _handleOnRAWQueryChange = (value) => {
    handleChange({ raw_query: value });
  };

  return (
    <div className="!flex flex-col justify-start items-stretch w-100 px-3">
      <div className="w-100 ">
        <CodeMirror
          value={value ? value.raw_query : ""}
          height="200px"
          extensions={[loadLanguage("pgsql")]}
          onChange={_handleOnRAWQueryChange}
          theme={githubLight}
          style={{
            marginTop: 20,
            width: "100%",
            borderWidth: 1,
            borderColor: theme.palette.divider,
          }}
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
        aria-label="basic tabs example"
        style={{
          background: theme.palette.background.paper,
          marginTop: 20,
        }}
      >
        <Tab label="Table" />
        <Tab label="JSON" />
        <Tab label="Raw" />
        <Tab label="Data Schema" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
      <div className="py-3 w-100 flex-grow h-full">
        {tab === 0 && (
          <RESTAPIQueryResponseTableTab
            json={pgQueryData ? pgQueryData : ""}
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
        {tab === 1 && (
          <RESTAPIQueryResponseJSONTab json={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 2 && (
          <RESTAPIQueryResponseRAWTab json={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 3 && (
          <RESTAPIQueryResponseSchemaTab
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
      </div>
    </div>
  );
};
