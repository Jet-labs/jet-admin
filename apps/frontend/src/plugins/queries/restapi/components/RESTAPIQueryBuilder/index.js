import {
  Button,
  Chip,
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
import { useMutation } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React, { useState } from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { runQueryAPI } from "../../../../../api/queries";
import {
  displayError,
  displaySuccess,
} from "../../../../../utils/notification";
import { RESTAPIQueryResponseJSONTab } from "../RESTAPIQueryResponseJSONTab";
import { RESTAPIQueryResponseRAWTab } from "../RESTAPIQueryResponseRAWTab";
import { RESTAPIQueryResponseSchemaTab } from "../RESTAPIQueryResponseSchemaTab";
import { RESTAPIQueryResponseTableTab } from "../RESTAPIQueryResponseTableTab";
import { QUERY_PLUGINS_MAP } from "../../..";
import { REST_API_METHODS } from "../../constants";

export const RESTAPIQueryBuilder = ({ pmQueryID, value, handleChange }) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [dataSchema, setDataSchema] = useState();

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const {
    isPending: isRunningPGQuery,
    isSuccess: isRunningPGQuerySuccess,
    isError: isRunningPGQueryError,
    error: runRESTAPIQueryError,
    mutate: runRESTAPIQuery,
    data: restAPIQueryData,
  } = useMutation({
    mutationFn: ({ raw_query }) => {
      return runQueryAPI({
        pm_query_type: QUERY_PLUGINS_MAP.REST_API.value,
        pm_query: { raw_query },
      });
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
    runRESTAPIQuery({ raw_query: value?.raw_query });
  };

  const _handleOnURLChange = (e) => {
    handleChange({ ...value, url: e.target.value });
  };
  const _handleOnMethodChange = (e) => {
    handleChange({ ...value, method: e.target.value });
  };

  console.log({ value });
  return (
    <div className="!flex flex-col justify-start items-stretch w-100 px-3">
      <Grid container className="!w-full">
        <Grid item sx={3} md={3} lg={3} className="w-full !pr-1">
          <FormControl size="small" className="!mt-2 !w-full">
            <span className="text-xs font-light  !capitalize mb-1">{`Method`}</span>
            <Select
              value={
                value && String(value.method).trim().length > 0
                  ? value.method
                  : REST_API_METHODS.GET.value
              }
              onChange={_handleOnMethodChange}
            >
              {Object.keys(REST_API_METHODS).map((methodValue) => {
                return (
                  <MenuItem
                    value={REST_API_METHODS[methodValue].value}
                    className="!break-words !whitespace-pre-line"
                    key={methodValue}
                    // style={{ background: REST_API_METHODS[methodValue].bg }}
                  >
                    {REST_API_METHODS[methodValue].name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item sx={9} md={9} lg={9} className="w-full !pl-1">
          <FormControl size="small" className="!mt-2 !w-full">
            <span className="text-xs font-light  !capitalize mb-1">{`Rest API URL`}</span>
            <TextField
              value={
                value && String(value.url).trim().length > 0 ? value.url : ""
              }
              placeholder="https://mock.api/todo"
              onChange={_handleOnURLChange}
              fullWidth
            />
          </FormControl>
        </Grid>
        <Grid item sx={12} md={12} lg={12} className="w-full">
          <Tabs
            value={tab}
            onChange={_handleTabChange}
            aria-label="basic tabs example"
            style={{
              marginTop: 20,
            }}
          >
            <Tab label="Headers" />
            <Tab label="Params" />
            <Tab label="Body" />
            <Tab label="Data Schema" />
          </Tabs>
          <Divider />
        </Grid>

        <div className="!flex flex-row justify-between items-center w-100 mt-3">
          {restAPIQueryData && Array.isArray(restAPIQueryData) ? (
            <span>{`Result : ${restAPIQueryData.length}`}</span>
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
      </Grid>

      <Tabs
        value={tab}
        onChange={_handleTabChange}
        aria-label="basic tabs example"
        style={{
          background: theme.palette.background.paper,
          marginTop: 20,
        }}
      >
        <Tab label="Table" />
        <Tab label="JSON" />
        <Tab label="Raw" />
        <Tab label="Data Schema" />
      </Tabs>
      <Divider style={{ width: "100%" }} />
      <div className="py-3 w-100 flex-grow h-full">
        {tab === 0 && (
          <RESTAPIQueryResponseTableTab
            json={restAPIQueryData ? restAPIQueryData : ""}
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
        {tab === 1 && (
          <RESTAPIQueryResponseJSONTab
            json={restAPIQueryData ? restAPIQueryData : ""}
          />
        )}
        {tab === 2 && (
          <RESTAPIQueryResponseRAWTab
            json={restAPIQueryData ? restAPIQueryData : ""}
          />
        )}
        {tab === 3 && (
          <RESTAPIQueryResponseSchemaTab
            dataSchema={dataSchema ? dataSchema : ""}
          />
        )}
      </div>
    </div>
  );
};
