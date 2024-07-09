import { Divider, Tab, Tabs, useTheme } from "@mui/material";

import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { capitalize } from "lodash";
import { useState } from "react";
import { containsOnly } from "../../../utils/array";
import { displayError } from "../../../utils/notification";
import { CRUDPermissionCheckboxGroup } from "../CRUDPermissionCheckboxGroup";

export const DashboardPolicyEditor = ({ value, handleChange }) => {
  const [tab, setTab] = useState(
    containsOnly(["add", "edit", "read", "delete"], Object.keys(value)) &&
      Object.keys(value).every((k) => typeof value[k] === "boolean")
      ? 0
      : 1
  );
  const theme = useTheme();
  const _handleOnTabChange = () => {
    if (tab === 1) {
      if (
        containsOnly(["add", "edit", "read", "delete"], Object.keys(value)) &&
        Object.keys(value).every((k) => typeof value[k] == "boolean")
      ) {
        setTab(0);
      } else {
        console.log(value);
        displayError({
          message:
            "JSON based policy detected. Please remove it to use visual editor",
        });
      }
    } else if (tab === 0) {
      setTab(1);
    }
  };

  return (
    <div className="!flex flex-col justify-start items-stretch w-full mt-4">
      <span className="!font-bold pl-1 py-2">{capitalize("Dashboards")}</span>
      <div className="!flex flex-col justify-start items-stretch w-full !border rounded !border-white !border-opacity-10">
        <Tabs
          value={tab}
          onChange={_handleOnTabChange}
          className="!min-h-0"
          style={{ background: theme.palette.background.paper }}
        >
          <Tab
            label="Visual editor"
            className="!font-bold !capitalize !py-2 !px-3 !min-h-0"
            sx={{ borderWidth: 1, minHeight: null, minWidth: null }}
          />
          <Tab
            label="Advance editor"
            className="!font-bold !capitalize !py-2 !px-3 !min-h-0"
            sx={{ borderWidth: 1, minHeight: null, minWidth: null }}
          />
        </Tabs>
        <Divider />
        {tab === 0 ? (
          <div className="py-2 px-4 ">
            <CRUDPermissionCheckboxGroup
              value={value}
              handleChange={handleChange}
            />
          </div>
        ) : (
          <div className="p-0">
            <CodeMirror
              value={
                typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : typeof value === "string"
                  ? value
                  : ""
              }
              height="200px"
              extensions={[loadLanguage("json")]}
              onChange={(value) => handleChange(JSON.parse(value))}
              theme={dracula}
              style={{
                borderWidth: 0,
                width: "100%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
