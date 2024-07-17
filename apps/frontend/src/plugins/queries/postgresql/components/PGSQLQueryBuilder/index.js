import { Button, Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import "react-data-grid/lib/styles.css";

import { QUERY_PLUGINS_MAP } from "../../..";
import { runQueryAPI } from "../../../../../api/queries";
import {
  displayError,
  displaySuccess,
} from "../../../../../utils/notification";
import { PGSQLQueryEditor } from "../PGSQLQueryEditor";
import { PGSQLQueryResponseJSONTab } from "../PGSQLQueryResponseJSONTab";
import { PGSQLQueryResponseRAWTab } from "../PGSQLQueryResponseRAWTab";
import { PGSQLQueryResponseSchemaTab } from "../PGSQLQueryResponseSchemaTab";
import { PGSQLQueryResponseTableTab } from "../PGSQLQueryResponseTableTab";

export const PGSQLQueryBuilder = ({ pmQueryID, value, handleChange }) => {
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

  return (
    <div className="!flex flex-col justify-start items-stretch w-100 px-3">
      <div className="w-100 ">
        <PGSQLQueryEditor value={value} handleChange={handleChange} />
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
        <Tab label="Table" />
        <Tab label="JSON" />
        <Tab label="Raw" />
        <Tab label="Data Schema" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
      <div className="py-3 w-100 flex-grow h-full">
        {tab === 0 && (
          <PGSQLQueryResponseTableTab data={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 1 && (
          <PGSQLQueryResponseJSONTab data={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 2 && (
          <PGSQLQueryResponseRAWTab data={pgQueryData ? pgQueryData : ""} />
        )}
        {tab === 3 && <PGSQLQueryResponseSchemaTab data={pgQueryData} />}
      </div>
    </div>
  );
};
