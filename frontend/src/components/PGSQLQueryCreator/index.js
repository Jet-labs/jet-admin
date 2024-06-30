import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  Tab,
  Tabs,
  TextField,
  useTheme,
} from "@mui/material";
import { capitalize } from "@rigu/js-toolkit";
import { useMutation } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useState } from "react";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { runPGQueryAPI } from "../../api/queries";
import { displayError, displaySuccess } from "../../utils/notification";
import "./style.css";

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

export const PGSQLQueryCreator = () => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [dataSchema, setDataSchema] = useState();

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const pgsqlQueryForm = useFormik({
    initialValues: {
      title: "Untitled",
      description: "",
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
      pgsqlQueryForm.setFieldValue("query", value);
    },
    [pgsqlQueryForm]
  );

  const {
    isPending: isRunningPGQuery,
    isSuccess: isRunningPGQuerySuccess,
    isError: isRunningPGQueryError,
    error: runPGQueryError,
    mutate: runPGQuery,
    data: pgQueryData,
  } = useMutation({
    mutationFn: ({ query }) => {
      return runPGQueryAPI({ query });
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
    runPGQuery({ query: pgsqlQueryForm.values.query });
  };

  return (
    <Grid container className="!h-max">
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
            value={pgsqlQueryForm.values.title}
            onChange={pgsqlQueryForm.handleChange}
            onBlur={pgsqlQueryForm.handleBlur}
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
            value={pgsqlQueryForm.values.description}
            onChange={pgsqlQueryForm.handleChange}
            onBlur={pgsqlQueryForm.handleBlur}
          />
          {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
        </FormControl>
        {/* <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Scheduler`}</span>
            <Cron
              onChange={(e, text) => {
                console.log({ e, text });
                queryForm.setFieldValue("scheduled_cron", e);
              }}
              value={queryForm.values.scheduled_cron}
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
        <div className="!flex flex-col justify-start items-stretch w-100">
          <div className="px-3 w-100 ">
            <CodeMirror
              value={pgsqlQueryForm.values.query}
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
              {pgQueryData && Array.isArray(pgQueryData) ? (
                <span>{`Result : ${pgQueryData.length}`}</span>
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
                json={pgQueryData ? pgQueryData : ""}
                dataSchema={dataSchema ? dataSchema : ""}
              />
            )}
            {tab === 1 && (
              <PGSQLQueryResponseJSONTab
                json={pgQueryData ? pgQueryData : ""}
              />
            )}
            {tab === 2 && (
              <PGSQLQueryResponseRAWTab json={pgQueryData ? pgQueryData : ""} />
            )}
            {tab === 3 && (
              <PGSQLQueryResponseSchemaTab
                dataSchema={dataSchema ? dataSchema : ""}
              />
            )}
          </div>
        </div>
      </Grid>
    </Grid>
  );
};
