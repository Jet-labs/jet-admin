import { Alert, Divider, Tab, Tabs, useTheme } from "@mui/material";
import React, { useState } from "react";
import "react-data-grid/lib/styles.css";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../../../components/Resizables";
import { PGSQLQueryEditor } from "../PGSQLQueryEditor";
import { PGSQLQueryResponseJSONTab } from "../PGSQLQueryResponseJSONTab";
import { PGSQLQueryResponseRAWTab } from "../PGSQLQueryResponseRAWTab";
import { PGSQLQueryResponseSchemaTab } from "../PGSQLQueryResponseSchemaTab";
import { PGSQLQueryResponseTableTab } from "../PGSQLQueryResponseTableTab";
import { PGSQLQueryTestForm } from "../PGSQLQueryTestForm";

export const PGSQLQueryBuilder = ({ pmQueryID, value, handleChange, args }) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [queryRunResult, setQueryRunResult] = useState();

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <ResizablePanelGroup
      direction="vertical"
      autoSaveId="pg-query-builder-form-panel-sizes"
      className="!flex flex-col justify-start items-stretch w-100"
    >
      <ResizablePanel defaultSize={40} className="px-3">
        <div className="w-100 ">
          <PGSQLQueryEditor value={value} handleChange={handleChange} />
          <Alert
            sx={{
              background: theme.palette.background.info,
              color: theme.palette.info.main,

              "& .MuiAlert-message": {
                marginTop: 0.2,
              },
            }}
            severity="info"
            className="!py-0 !mt-3 !text-xs"
          >
            {`Query objects are intended to allow only data manupulation and data fetching queries`}
          </Alert>
          <div className="!flex flex-row justify-between items-center w-100 mt-3">
            {queryRunResult && Array.isArray(queryRunResult) ? (
              <span>{`Result : ${queryRunResult.length}`}</span>
            ) : (
              <span></span>
            )}

            <div className="!flex flex-row justify-start items-center">
              <PGSQLQueryTestForm
                setQueryRunResult={setQueryRunResult}
                pmQueryID={pmQueryID}
                value={value}
                args={args}
              />
            </div>
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
          <Tab label="Table" />
          <Tab label="JSON" />
          <Tab label="Raw" />
          <Tab label="Data Schema" />
        </Tabs>
        <Divider style={{ width: "100%" }} />
        <div className="py-3 w-100 flex-grow h-full">
          {tab === 0 && (
            <PGSQLQueryResponseTableTab
              data={queryRunResult ? queryRunResult : ""}
            />
          )}
          {tab === 1 && (
            <PGSQLQueryResponseJSONTab
              data={queryRunResult ? queryRunResult : ""}
            />
          )}
          {tab === 2 && (
            <PGSQLQueryResponseRAWTab
              data={queryRunResult ? queryRunResult : ""}
            />
          )}
          {tab === 3 && <PGSQLQueryResponseSchemaTab data={queryRunResult} />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
