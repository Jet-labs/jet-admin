import { Divider, Tab, Tabs, useTheme } from "@mui/material";

import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { capitalize } from "lodash";
import { useState } from "react";
import { containsOnly } from "../../../../utils/array";
import { displayError } from "../../../../utils/notification";
import { CRUDPermissionCheckboxGroup } from "../CRUDPermissionCheckboxGroup";
import { useThemeValue } from "../../../../contexts/themeContext";
export const DashboardPolicyEditor = ({ value, handleChange }) => {
  const { themeType } = useThemeValue();
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
    <div
      className="!flex flex-col justify-start items-stretch w-full mt-4  border rounded"
      style={{ borderColor: theme.palette.divider }}
    >
      <span
        style={{ background: theme.palette.background.paper }}
        className="!font-bold pl-2 py-2 rounded-t"
      >
        {capitalize("Dashboards")}
      </span>
      <Divider />
      <div className="!flex flex-col justify-start items-stretch w-full ">
        <Tabs value={tab} onChange={_handleOnTabChange} className="!min-h-0">
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
              theme={themeType == "dark" ? vscodeDark : githubLight}
              className="codemirror-editor-rounded-bottom"
              style={{
                borderWidth: 0,
                width: "100%",
                borderBottomRightRadius: 4,
                borderBottomLeftRadius: 4,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
