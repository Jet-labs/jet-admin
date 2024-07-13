import { Divider, Tab, Tabs, useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { capitalize } from "lodash";
import { useMemo, useState } from "react";
import { useConstants } from "../../../../contexts/constantsContext";
import { containsOnly } from "../../../../utils/array";
import { displayError } from "../../../../utils/notification";
import { CRUDPermissionCheckboxGroup } from "../CRUDPermissionCheckboxGroup";
export const TablePolicyEditor = ({ value, handleChange }) => {
  const { dbModel } = useConstants();
  const isVisualEditorSufficient = useMemo(() => {
    let res = true;
    if (value) {
      Object.keys(value).forEach((table) => {
        if (
          typeof value[table] === "object" &&
          !(
            containsOnly(
              ["add", "edit", "read", "delete"],
              Object.keys(value[table])
            ) &&
            Object.keys(value[table]).every(
              (k) => typeof value[table][k] === "boolean"
            )
          )
        ) {
          res = false;
        }
      });
    }
    return res;
  }, [value]);
  const [tab, setTab] = useState(isVisualEditorSufficient ? 0 : 1);
  const theme = useTheme();
  const _handleOnTabChange = () => {
    if (tab === 1) {
      if (isVisualEditorSufficient) {
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
        className="!font-bold pl-1 py-2 rounded-t"
      >
        {capitalize("Tables")}
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
          <div className="!flex flex-col justify-start items-stretch w-full p-3">
            {dbModel?.map((tableProperty) => {
              if (
                value[tableProperty.name] == undefined ||
                value[tableProperty.name] == null
              ) {
                return (
                  <CRUDPermissionCheckboxGroup
                    label={
                      <span className="capitalize">{tableProperty.name}</span>
                    }
                    value={
                      value[tableProperty.name]
                        ? { add: true, edit: true, read: true, delete: true }
                        : {
                            add: false,
                            edit: false,
                            read: false,
                            delete: false,
                          }
                    }
                    handleChange={(v) => {
                      handleChange({ ...value, [tableProperty.name]: v });
                    }}
                  />
                );
              } else if (
                value[tableProperty.name] != undefined &&
                value[tableProperty.name] != null &&
                typeof value[tableProperty.name] === "boolean"
              ) {
                return (
                  <CRUDPermissionCheckboxGroup
                    label={
                      <span className="capitalize">{tableProperty.name}</span>
                    }
                    value={
                      value[tableProperty.name]
                        ? { add: true, edit: true, read: true, delete: true }
                        : {
                            add: false,
                            edit: false,
                            read: false,
                            delete: false,
                          }
                    }
                    handleChange={(v) => {
                      handleChange({ ...value, [tableProperty.name]: v });
                    }}
                  />
                );
              } else if (
                containsOnly(
                  ["add", "edit", "read", "delete"],
                  Object.keys(value[tableProperty.name])
                )
              ) {
                return (
                  <CRUDPermissionCheckboxGroup
                    label={
                      <span className="capitalize">{tableProperty.name}</span>
                    }
                    value={value[tableProperty.name]}
                    handleChange={(v) => {
                      handleChange({ ...value, [tableProperty.name]: v });
                    }}
                  />
                );
              } else {
                return (
                  <CodeMirror
                    value={
                      typeof value[tableProperty.name] === "object"
                        ? JSON.stringify(value[tableProperty.name], null, 2)
                        : typeof value[tableProperty.name] === "string"
                        ? value[tableProperty.name]
                        : ""
                    }
                    height="200px"
                    extensions={[loadLanguage("json")]}
                    onChange={(v) => {
                      handleChange({
                        ...value,
                        [tableProperty.name]:
                          typeof v === "object" ? v : JSON.parse(v),
                      });
                    }}
                    theme={dracula}
                    style={{
                      borderWidth: 0,
                      width: "100%",
                    }}
                  />
                );
              }
            })}
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
              theme={githubLight}
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
