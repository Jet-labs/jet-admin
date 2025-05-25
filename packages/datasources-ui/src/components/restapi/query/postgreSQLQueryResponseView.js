import { Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { PostgreSQLQueryResponseJSONTab } from "./postgreSQLQueryResponseJSONTab";
import { PostgreSQLQueryResponseRAWTab } from "./postgreSQLQueryResponseRawTab";
import { PostgreSQLQueryResponseSchemaTab } from "./postgreSQLQueryResponseSchemaTab";
import { PostgreSQLQueryResponseTableTab } from "./postgreSQLQueryResponseTableTab";
import PropTypes from "prop-types";

export const PostgreSQLQueryResponseView = ({ queryResult }) => {
  PostgreSQLQueryResponseView.propTypes = {
    queryResult: PropTypes.object,
  };
  const [tab, setTab] = useState(0);
  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };
  return (
    <>
      <Tabs
        value={tab}
        onChange={_handleTabChange}
        className="!w-full !border-b !border-gray-200"
        sx={{
          "& .MuiTabs-indicator": {
            background: "#646cff !important",
          },
        }}
      >
        <Tab
          label="Table"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 0 ? "!text-[#646cff]" : "!text-slate-700"
          }`}
        />
        <Tab
          label="JSON"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 1 ? "!text-[#646cff]" : "!text-slate-700"
          }`}
        />
        <Tab
          label="Raw"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 2 ? "!text-[#646cff]" : "!text-slate-700"
          }`}
        />
        <Tab
          label="Data Schema"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 3 ? "!text-[#646cff]" : "!text-slate-700"
          }`}
        />
      </Tabs>
      <div className="w-100 h-[calc(100%-48px)]">
        {tab === 0 && (
          <PostgreSQLQueryResponseTableTab
            data={queryResult ? queryResult.result : ""}
          />
        )}
        {tab === 1 && (
          <PostgreSQLQueryResponseJSONTab
            data={queryResult ? queryResult.result : ""}
          />
        )}
        {tab === 2 && (
          <PostgreSQLQueryResponseRAWTab
            data={queryResult ? queryResult.result : ""}
          />
        )}
        {tab === 3 && (
          <PostgreSQLQueryResponseSchemaTab
            data={queryResult ? queryResult.result : {}}
          />
        )}
      </div>
    </>
  );
};
