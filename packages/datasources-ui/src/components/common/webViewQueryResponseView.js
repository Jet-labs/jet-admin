import { Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { QueryResponseJSONTab } from "./queryResponseJSONTab";
import { QueryResponseRAWTab } from "./queryResponseRawTab";
import { QueryResponseSchemaTab } from "./queryResponseSchemaTab";
import { QueryResponseTableTab } from "./queryResponseTableTab";
import PropTypes from "prop-types";
import { QueryResponseWebViewTab } from "./queryResponseWebViewTab";

export const WebViewQueryResponseView = ({ queryResult }) => {
  WebViewQueryResponseView.propTypes = {
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
        className="!w-full !border-b !border-slate-200"
        sx={{
          "& .MuiTabs-indicator": {
            background: "#646cff !important",
          },
        }}
      >
        <Tab
          label="Web View"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 0 ? "!text-[#646cff]" : "!text-[#1c1c1e]"
          }`}
        />
        <Tab
          label="JSON"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 1 ? "!text-[#646cff]" : "!text-[#1c1c1e]"
          }`}
        />
        <Tab
          label="Raw"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 2 ? "!text-[#646cff]" : "!text-[#1c1c1e]"
          }`}
        />
        <Tab
          label="Data Schema"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          className={`!outline-none !border-0 hover:!outline-none hover:!border-0 focus:!outline-none !font-medium !text-sm !normal-case ${
            tab === 3 ? "!text-[#646cff]" : "!text-[#1c1c1e]"
          }`}
        />
      </Tabs>
      <div className="w-100  h-full overflow-y-auto pb-5">
        {tab === 0 && (
          <QueryResponseWebViewTab data={queryResult ? queryResult : ""} />
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
