import {
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import { addGraphAPI } from "../../api/graphs";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import "./style.css";
import { runPGQueryDataSourceAPI } from "../../api/dataSources";
import jsonSchemaGenerator from "to-json-schema";

const PGSQLQueryEditor = () => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };
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

  const {
    isPending: isRunningPGQueryDataSource,
    isSuccess: isRunningPGQueryDataSourceSuccess,
    isError: isRunningPGQueryDataSourceError,
    error: runPGQueryDataSourceError,
    mutate: runPGQueryDataSource,
    data: pgQueryDataSourceData,
  } = useMutation({
    mutationFn: ({ query }) => {
      return runPGQueryDataSourceAPI({ query });
    },
    retry: false,
    onSuccess: (data) => {
      console.log({ data });
      const dataSchema = jsonSchemaGenerator(
        Array.isArray(data) ? data[0] : data
      );
      console.log(dataSchema);
      displaySuccess("Query executed successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _runQuery = () => {
    runPGQueryDataSource({ query: pgsqlDataSourceForm.values.query });
  };

  return (
    <div className="!flex flex-col justify-start items-stretch w-100">
      <div className="px-3 w-100 ">
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
            borderRadius: 6,
            width: "100%",
          }}
        />
        <div className="!flex flex-row justify-between items-center w-100 mt-3">
          {pgQueryDataSourceData && Array.isArray(pgQueryDataSourceData) ? (
            <span>{`Result : ${pgQueryDataSourceData.length}`}</span>
          ) : (
            <span></span>
          )}
          <div className="!flex flex-row justify-start items-center">
            <Button
              variant="contained"
              onClick={_runQuery}
            >{`Save data source`}</Button>
            <Button
              variant="contained"
              className="!ml-3"
              onClick={_runQuery}
            >{`Test query`}</Button>
          </div>
        </div>
      </div>

      <Divider style={{ width: "100%", marginTop: 10 }} />
      <Tabs
        value={tab}
        onChange={_handleTabChange}
        aria-label="basic tabs example"
        className="!px-3"
      >
        <Tab label="Table" />
        <Tab label="JSON" />
        <Tab label="Raw" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
    </div>
  );
};
const AddDataSource = () => {
  const theme = useTheme();

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

      <Grid container className="">
        <Grid
          item
          sx={6}
          md={6}
          lg={6}
          className="w-full !border-r !border-white !border-opacity-10"
        >
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
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
        <Grid item sx={6} md={6} lg={6} className="w-full"></Grid>
      </Grid>
    </div>
  );
};

export default AddDataSource;
