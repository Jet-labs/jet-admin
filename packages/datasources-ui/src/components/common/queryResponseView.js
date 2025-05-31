import { Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { QueryResponseJSONTab } from "./queryResponseJSONTab";
import { QueryResponseRAWTab } from "./queryResponseRawTab";
import { QueryResponseSchemaTab } from "./queryResponseSchemaTab";
import { QueryResponseTableTab } from "./queryResponseTableTab";
import PropTypes from "prop-types";

export const QueryResponseView = ({ queryResult }) => {
  QueryResponseView.propTypes = {
    queryResult: PropTypes.object,
  };
  console.log("queryResult", queryResult);
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
          <QueryResponseTableTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 1 && (
          <QueryResponseJSONTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 2 && (
          <QueryResponseRAWTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 3 && (
          <QueryResponseSchemaTab data={queryResult ? queryResult : {}} />
        )}
      </div>
    </>
  );
};
