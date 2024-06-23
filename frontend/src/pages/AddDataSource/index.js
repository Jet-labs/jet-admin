import { FormControl, Grid, MenuItem, Select, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import { addGraphAPI } from "../../api/graphs";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";

const PGSQLQueryEditor = () => {
  const theme = useTheme();
  const pgsqlDataSourceForm = useFormik({
    initialValues: {
      query: "",
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      console.log({ values });
    },
  });
  const _handleOnChange = useCallback(
    (value, viewUpdate) => {
      pgsqlDataSourceForm.setFieldValue("query", value);
    },
    [pgsqlDataSourceForm]
  );
  return (
    <CodeMirror
      value={pgsqlDataSourceForm.values.query}
      height="200px"
      extensions={[loadLanguage("pgsql")]}
      onChange={_handleOnChange}
      theme={dracula}
      style={{
        borderWidth: 1,
        borderColor: theme.palette.primary.main,
        marginTop: 20,
      }}
    />
  );
};
const AddDataSource = () => {
  const theme = useTheme();
  const {
    isPending: isAddingGraph,
    isSuccess: isAddingGraphSuccess,
    isError: isAddingGraphError,
    error: addGraphError,
    mutate: addGraph,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addGraphAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Added data source successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const dataSourceForm = useFormik({
    initialValues: {
      title: "Untitled",
      description: "",
      data_source_type: LOCAL_CONSTANTS.DATA_SOURCE_TYPES.POSTGRE_QUERY.value,
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      console.log({ values });
    },
  });

  return (
    <div className="w-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new data source`}</span>
      </div>

      <Grid container spacing={1} className="!px-3">
        <Grid item lg={7} md={8} className="w-full">
          <FormControl fullWidth size="small" className="!mt-2">
            <span className="text-xs font-light  !lowercase mb-1">{`Data source type`}</span>

            <Select
              value={dataSourceForm.values.data_source_type}
              onChange={dataSourceForm.handleChange}
              onBlur={dataSourceForm.handleBlur}
              name={"data_source_type"}
              required={true}
              size="small"
              fullWidth={false}
            >
              {Object.keys(LOCAL_CONSTANTS.DATA_SOURCE_TYPES).map(
                (dataSourceType) => {
                  const value =
                    LOCAL_CONSTANTS.DATA_SOURCE_TYPES[dataSourceType].value;
                  const name =
                    LOCAL_CONSTANTS.DATA_SOURCE_TYPES[dataSourceType].name;
                  return <MenuItem value={value}>{name}</MenuItem>;
                }
              )}
            </Select>
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <PGSQLQueryEditor />
        </Grid>
        <Grid item lg={5} md={4} className="w-full"></Grid>
      </Grid>
    </div>
  );
};

export default AddDataSource;
