import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { fetchRowByIDAPI } from "../../api/tables";

import {
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateRowAPI } from "../../api/tables";
import { FieldComponent } from "../../components/FieldComponent";
import { RowDeletionForm } from "../../components/RowDeletetionForm";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { Loading } from "../Loading";
import { containsOnly } from "../../utils/array";
import { capitalize } from "lodash";
import { useConstants } from "../../contexts/constantsContext";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { useTheme } from "@emotion/react";
import CodeMirror from "@uiw/react-codemirror";
const TablePolicyEditor = ({ value, handleChange }) => {
  const { dbModel } = useConstants();

  return (
    <div className="!w-full mt-10">
      <span className="!font-bold capitalize">Tables</span>
      <div className="!w-full pl-8">
        {dbModel?.map((tableProperty) => {
          if (
            value[tableProperty.name] == undefined ||
            value[tableProperty.name] == null
          ) {
            return (
              <CRUDPermissionCheckboxGroup
                label={capitalize(tableProperty.name)}
                value={
                  value[tableProperty.name]
                    ? { add: true, edit: true, read: true, delete: true }
                    : { add: false, edit: false, read: false, delete: false }
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
                label={capitalize(tableProperty.name)}
                value={
                  value[tableProperty.name]
                    ? { add: true, edit: true, read: true, delete: true }
                    : { add: false, edit: false, read: false, delete: false }
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
                label={capitalize(tableProperty.name)}
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
    </div>
  );
};

const GraphPolicyEditor = ({ value, handleChange }) => {
  const theme = useTheme();
  return containsOnly(["add", "edit", "read", "delete"], Object.keys(value)) ? (
    <CRUDPermissionCheckboxGroup
      label={capitalize("Graphs")}
      value={value}
      handleChange={handleChange}
    />
  ) : (
    <div>
      <span className="!font-bold">{capitalize("Graphs")}</span>
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
          borderWidth: 1,
          borderColor: theme.palette.primary.main,
          marginTop: 6,
          borderRadius: 6,
          width: "100%",
        }}
      />
    </div>
  );
};

const CRUDPermissionCheckboxGroup = ({ label, value, handleChange }) => {
  const _handleChange = (_value, checked) => {
    handleChange({ ...value, [_value]: checked });
  };

  return (
    <Grid container>
      <Grid
        item
        xs={4}
        sm={4}
        md={4}
        lg={4}
        xl={4}
        className="!flex !justify-start !items-center"
      >
        <span className="!font-bold">{label}</span>
      </Grid>
      {Object.keys(value).map((_value) => {
        return (
          <Grid
            item
            xs={2}
            sm={2}
            md={2}
            lg={2}
            xl={2}
            className="!flex !justify-start !items-center !flex-row"
          >
            <label className="!capitalize">{_value}</label>
            <Checkbox
              checked={Boolean(value[_value])}
              onChange={(e) => {
                _handleChange(_value, e.target.checked);
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
const GUIPolicyEditor = ({ policy, handleChange }) => {
  const _policy = policy;

  return (
    <Grid item xs={12} sm={12} md={12} lg={12} key={"_policy"}>
      {Object.keys(_policy).map((key) => {
        if (key == "tables") {
          return <TablePolicyEditor value={_policy[key]} />;
        } else if (key == "graphs") {
          return (
            <GraphPolicyEditor
              value={_policy[key]}
              handleChange={(value) => {
                handleChange({ ...policy, graphs: value });
              }}
            />
          );
        } else if (
          containsOnly(
            ["add", "edit", "read", "delete"],
            Object.keys(_policy[key])
          )
        ) {
          return (
            <CRUDPermissionCheckboxGroup
              label={capitalize(key)}
              value={_policy[key]}
              handleChange={() => {}}
            />
          );
        } else {
          return (
            <FieldComponent
              type={LOCAL_CONSTANTS.DATA_TYPES.JSON}
              name={key}
              value={_policy[key]}
              // onChange={policyObjectUpdateForm.handleChange}
              // setFieldValue={policyObjectUpdateForm.setFieldValue}
              // helperText={policyObjectUpdateForm.errors["policy"]}
              // error={Boolean(policyObjectUpdateForm.errors["policy"])}
              required={true}
              customMapping={null}
              language={"json"}
              customLabel={
                <span className="!font-bold !mb-1">{capitalize(key)}</span>
              }
            />
          );
        }
      })}
    </Grid>
  );
};
const UpdatePolicy = () => {
  const { dbModel } = useConstants();
  console.log({ dbModel });
  const tableName = LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME;
  const { id } = useParams();
  const queryClient = new QueryClient();
  const [policyEditorTab, setPolicyEditorTab] = useState(0);

  const {
    isLoading: isLoadingPolicyObjectData,
    data: policyObjectData,
    error: loadPolicyObjectDataError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`, id],
    queryFn: () => fetchRowByIDAPI({ tableName, id }),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });

  const {
    isPending: isUpdatingPolicyObject,
    isSuccess: isUpdatePolicyObjectSuccess,
    isError: isUpdatePolicyObjectError,
    error: updatePolicyObjectError,
    mutate: updateRow,
  } = useMutation({
    mutationFn: ({ tableName, id, data }) => {
      return updateRowAPI({ tableName, id, data });
    },

    retry: false,
    onSuccess: () => {
      displaySuccess("Updated policy successfully");
      queryClient.invalidateQueries([
        `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}`,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const policyObjectUpdateForm = useFormik({
    initialValues: {},
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      updateRow({ tableName, id, data: values });
    },
  });

  useEffect(() => {
    if (policyObjectData) {
      policyObjectUpdateForm.setFieldValue("title", policyObjectData.title);
      policyObjectUpdateForm.setFieldValue(
        "pm_policy_object_id",
        policyObjectData.pm_policy_object_id
      );
      policyObjectUpdateForm.setFieldValue(
        "is_disabled",
        policyObjectData.is_disabled
      );
      policyObjectUpdateForm.setFieldValue("policy", policyObjectData.policy);
    }
  }, [policyObjectData]);

  const _handlePolicyEditorTabChange = (event, newTab) => {
    setPolicyEditorTab(newTab);
  };

  return !isLoadingPolicyObjectData &&
    !isLoadingPolicyObjectData &&
    policyObjectData ? (
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">{`Policy settings`}</span>
          <span className="text-xs font-thin text-start text-slate-300">{`Account settings | Username : ${policyObjectData.title}`}</span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
          <RowDeletionForm tableName={tableName} id={id} />
          <Button
            disableElevation
            variant="contained"
            size="small"
            type="submit"
            startIcon={
              isUpdatingPolicyObject && (
                <CircularProgress color="inherit" size={12} />
              )
            }
            className="!ml-2"
            onClick={policyObjectUpdateForm.submitForm}
          >
            Update
          </Button>
        </div>
      </div>
      <Paper
        className="px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3"
        variant="outlined"
      >
        <form className="" onSubmit={policyObjectUpdateForm.handleSubmit}>
          <Grid container rowSpacing={2} className="!mt-2">
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={"pm_policy_object_id"}
            >
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.INT}
                name={"pm_policy_object_id"}
                value={policyObjectUpdateForm.values["pm_policy_object_id"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={
                  policyObjectUpdateForm.errors["pm_policy_object_id"]
                }
                error={Boolean(
                  policyObjectUpdateForm.errors["pm_policy_object_id"]
                )}
                required={true}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"title"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
                name={"title"}
                value={policyObjectUpdateForm.values["title"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={policyObjectUpdateForm.errors["title"]}
                error={Boolean(policyObjectUpdateForm.errors["title"])}
                required={true}
                customMapping={null}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} key={"is_disabled"}>
              <FieldComponent
                type={LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN}
                name={"is_disabled"}
                value={policyObjectUpdateForm.values["is_disabled"]}
                onBlur={policyObjectUpdateForm.handleBlur}
                onChange={policyObjectUpdateForm.handleChange}
                setFieldValue={policyObjectUpdateForm.setFieldValue}
                helperText={policyObjectUpdateForm.errors["is_disabled"]}
                error={Boolean(policyObjectUpdateForm.errors["is_disabled"])}
                required={true}
                customMapping={null}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              className="!border-b !border-white !border-opacity-10"
            >
              <Tabs
                value={policyEditorTab}
                onChange={_handlePolicyEditorTabChange}
                aria-label="basic tabs example"
              >
                <Tab label="Visual editor" className="!font-bold !capitalize" />
                <Tab label="JSON editor" className="!font-bold !capitalize" />
              </Tabs>
            </Grid>
            {policyEditorTab === 0 ? (
              <GUIPolicyEditor
                policy={policyObjectData.policy}
                handleChange={(value) => {
                  policyObjectUpdateForm.setFieldValue("policy", value);
                }}
              />
            ) : (
              <Grid item xs={12} sm={12} md={12} lg={12} key={"policy"}>
                <FieldComponent
                  type={LOCAL_CONSTANTS.DATA_TYPES.JSON}
                  name={"policy"}
                  value={policyObjectUpdateForm.values["policy"]}
                  onBlur={policyObjectUpdateForm.handleBlur}
                  onChange={policyObjectUpdateForm.handleChange}
                  setFieldValue={policyObjectUpdateForm.setFieldValue}
                  helperText={policyObjectUpdateForm.errors["policy"]}
                  error={Boolean(policyObjectUpdateForm.errors["policy"])}
                  required={true}
                  customMapping={null}
                  language={"json"}
                />
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </div>
  ) : (
    <Loading />
  );
};

export default UpdatePolicy;
