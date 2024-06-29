import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  useTheme,
} from "@mui/material";
import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useState } from "react";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import "./style.css";
import { runPGQueryDataSourceAPI } from "../../api/dataSources";
import jsonSchemaGenerator from "to-json-schema";
import { capitalize } from "@rigu/js-toolkit";
import Cron from "react-cron-generator";

const PGSQLQueryResponseTableTab = ({ json, dataSchema }) => {
  const theme = useTheme();

  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return { key, name: capitalize(key) };
      });
    }
  }, [dataSchema]);

  return (
    <Box
      sx={{ width: "100%" }}
      className="!flex !flex-col !justify-center !items-stretch"
    >
      {json && Array.isArray(json) && json.length ? (
        <DataGrid
          rows={json.map((item, index) => {
            return { _g_uuid: `_index_${index}`, ...item };
          })}
          columns={columns}
          className="!w-100 !border !border-white !border-opacity-10"
          rowKeyGetter={(row) => row._g_uuid}
          defaultColumnOptions={{
            sortable: false,
            resizable: true,
          }}
        />
      ) : (
        <div className="!h-32 flex !flex-col !justify-center !items-center w-100">
          <span>No data</span>
        </div>
      )}
    </Box>
  );
};

const PGSQLQueryResponseJSONTab = ({ json }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(json, null, 2)}
      height="400px"
      extensions={[loadLanguage("json")]}
      theme={dracula}
      style={{
        width: "100%",
      }}
      className="no-code-mirror-border !border !border-white !border-opacity-10"
    />
  );
};

const PGSQLQueryResponseRAWTab = ({ json }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(json, null, 2)}
      height="400px"
      theme={dracula}
      style={{
        width: "100%",
      }}
      className="no-code-mirror-border !border !border-white !border-opacity-10"
    />
  );
};
const PGSQLQueryResponseSchemaTab = ({ dataSchema }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(dataSchema, null, 2)}
      height="400px"
      theme={dracula}
      extensions={[loadLanguage("json")]}
      style={{
        width: "100%",
      }}
      className="no-code-mirror-border !border !border-white !border-opacity-10"
    />
  );
};
const PGSQLQueryEditor = () => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [dataSchema, setDataSchema] = useState();

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
      setDataSchema(jsonSchemaGenerator(Array.isArray(data) ? data[0] : data));
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
              variant="outlined"
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
        <Tab label="Data Schema" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
      <div className="p-3 w-100 flex-grow h-full">
        {tab === 0 && (
          <PGSQLQueryResponseTableTab
            json={pgQueryDataSourceData ? pgQueryDataSourceData : ""}
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
        {tab === 1 && (
          <PGSQLQueryResponseJSONTab
            json={pgQueryDataSourceData ? pgQueryDataSourceData : ""}
          />
        )}
        {tab === 2 && (
          <PGSQLQueryResponseRAWTab
            json={pgQueryDataSourceData ? pgQueryDataSourceData : ""}
          />
        )}
        {tab === 3 && (
          <PGSQLQueryResponseSchemaTab
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
      </div>
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
    <div className="w-full !h-[calc(100vh-123px)]">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new data source`}</span>
      </div>

      <Grid container className="!h-full">
        <Grid
          item
          sx={4}
          md={4}
          lg={4}
          className="w-full !border-r !border-white !border-opacity-10 !h-full"
        >
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Title`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"title"}
              value={dataSourceForm.values.title}
              onChange={dataSourceForm.handleChange}
              onBlur={dataSourceForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Description`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"description"}
              value={dataSourceForm.values.description}
              onChange={dataSourceForm.handleChange}
              onBlur={dataSourceForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          {/* <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Scheduler`}</span>
            <Cron
              onChange={(e, text) => {
                console.log({ e, text });
                dataSourceForm.setFieldValue("scheduled_cron", e);
              }}
              value={dataSourceForm.values.scheduled_cron}
              showResultText={true}
              showResultCron={true}
            />
          </FormControl> */}
          <div className="!flex flex-row justify-end items-center mt-10 w-100 px-3">
            <Button
              variant="contained"
              className="!ml-3"
              // onClick={_runQuery}
            >{`Save data source`}</Button>
          </div>
        </Grid>
        <Grid item sx={8} md={8} lg={8} className="w-full">
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
      </Grid>
    </div>
  );
};

export default AddDataSource;
