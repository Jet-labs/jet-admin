import { useConstants } from "../../../contexts/constantsContext";
import { LOCAL_CONSTANTS } from "../../../constants";
import { containsOnly } from "../../../utils/array";
import { CRUDPermissionCheckboxGroup } from "../CRUDPermissionCheckboxGroup";
import { FieldComponent } from "../../FieldComponent";
import { capitalize } from "lodash";
import { Divider, Tab, Tabs, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { displayError } from "../../../utils/notification";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";

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
  const _handleOnTabChange = useCallback(() => {
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
  }, [isVisualEditorSufficient]);
  return (
    <div className="!flex flex-col justify-start items-stretch w-full mt-4">
      <span className="!font-bold pl-1 py-2">{capitalize("Tables")}</span>

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
                    handleChange={() => {}}
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
                    handleChange={() => {}}
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
                    handleChange={() => {}}
                  />
                );
              } else {
                return (
                  <FieldComponent
                    type={LOCAL_CONSTANTS.DATA_TYPES.JSON}
                    name={tableProperty.name}
                    value={value[tableProperty.name]}
                    // onChange={policyObjectUpdateForm.handleChange}
                    // setFieldValue={policyObjectUpdateForm.setFieldValue}
                    // helperText={policyObjectUpdateForm.errors["policy"]}
                    // error={Boolean(policyObjectUpdateForm.errors["policy"])}
                    required={true}
                    customMapping={null}
                    language={"json"}
                    customLabel={
                      <span className="!mb-1">{tableProperty.name}</span>
                    }
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
