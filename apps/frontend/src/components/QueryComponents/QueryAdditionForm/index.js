import { Button, FormControl, TextField, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback } from "react";
import "react-data-grid/lib/styles.css";
import { addQueryAPI } from "../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ArrayInput } from "../../ArrayInputComponent";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
import { PGSQLQueryBuilder } from "../QueryBuilderComponents/PGSQLQueryBuilder";

export const QueryAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const queryAdditionForm = useFormik({
    initialValues: {
      pm_query_title: "Untitled",
      pm_query_description: "",
      pm_query_type: "POSTGRE_QUERY",
      pm_query: {},
      pm_query_args: [],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      addPGQuery(values);
    },
  });

  const {
    isPending: isAddingPGQuery,
    isSuccess: isAddingPGQuerySuccess,
    isError: isAddingPGQueryError,
    error: addPGQueryError,
    mutate: addPGQuery,
  } = useMutation({
    mutationFn: (queryData) => {
      return addQueryAPI({
        data: queryData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.QUERY_ADDITION_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOnQueryChange = useCallback(
    (value) => {
      if (queryAdditionForm) {
        queryAdditionForm.setFieldValue("pm_query", value);
      }
    },
    [queryAdditionForm]
  );

  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row items-center justify-between p-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start mt-1">
          {LOCAL_CONSTANTS.STRINGS.QUERY_ADDITION_PAGE_TITLE}
        </span>
        <div className="!flex flex-row justify-end items-center">
          <Button
            variant="contained"
            className="!ml-3"
            onClick={queryAdditionForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="query-addition-form-panel-sizes"
        className="!h-full"
      >
        <ResizablePanel
          defaultSize={40}
          className="w-full"
          style={{ borderRightWidth: 1, borderColor: theme.palette.divider }}
        >
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Title`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_query_title"}
              value={queryAdditionForm.values.pm_query_title}
              onChange={queryAdditionForm.handleChange}
              onBlur={queryAdditionForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Description`}</span>

            <TextField
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              name={"pm_query_description"}
              value={queryAdditionForm.values.pm_query_description}
              onChange={queryAdditionForm.handleChange}
              onBlur={queryAdditionForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Arguments`}</span>
            <ArrayInput
              value={queryAdditionForm.values.pm_query_args}
              onChange={(value) => {
                queryAdditionForm.setFieldValue("pm_query_args", value);
              }}
              type={"text"}
            />
          </FormControl>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={60} className="w-full !h-full">
          <PGSQLQueryBuilder
            value={queryAdditionForm.values.pm_query}
            handleChange={_handleOnQueryChange}
            args={queryAdditionForm.values.pm_query_args}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
