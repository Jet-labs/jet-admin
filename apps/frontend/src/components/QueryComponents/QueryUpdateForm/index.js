import { Button, FormControl, TextField, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import { SiPostgresql } from "react-icons/si";
import { getQueryByIDAPI, updateQueryAPI } from "../../../api/queries";
import { query_variable_usage_tip } from "../../../assets/tips";
import { LOCAL_CONSTANTS } from "../../../constants";
import { PGSQLQueryBuilder } from "../QueryBuilderComponents/PGSQLQueryBuilder";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ArrayInput } from "../../ArrayInputComponent";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
import { Tip } from "../../Tip";
import { QueryDeletionForm } from "../QueryDeletionForm";
import { QueryDuplicateForm } from "../QueryDuplicateForm";

export const QueryUpdateForm = ({ id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingQueryData,
    data: queryData,
    error: loadQueryDataError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES, id],
    queryFn: () => getQueryByIDAPI({ pmQueryID: id }),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const queryBuilderForm = useFormik({
    initialValues: {
      pm_query_title: "Untitled",
      pm_query_description: "",
      pm_query_type: "POSTGRE_QUERY",
      pm_query: null,
      pm_query_id: parseInt(id),
      pm_query_args: [],
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {},
  });

  useEffect(() => {
    if (queryBuilderForm && queryData) {
      queryBuilderForm.setFieldValue("pm_query_id", queryData.pm_query_id);
      queryBuilderForm.setFieldValue(
        "pm_query_title",
        queryData.pm_query_title
      );
      queryBuilderForm.setFieldValue(
        "pm_query_description",
        queryData.pm_query_description
      );
      queryBuilderForm.setFieldValue("pm_query_type", queryData.pm_query_type);
      queryBuilderForm.setFieldValue("pm_query", queryData.pm_query);
      queryBuilderForm.setFieldValue("pm_query_args", queryData.pm_query_args);
    }
  }, [queryData]);

  const {
    isPending: isUpdatingQuery,
    isSuccess: isUpdatingQuerySuccess,
    isError: isUpdatingQueryError,
    error: updateQueryError,
    mutate: updateQuery,
  } = useMutation({
    mutationFn: (queryData) => {
      return updateQueryAPI({
        data: queryData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.QUERY_UPDATED_SUCCESS);
      queryClient.invalidateQueries([LOCAL_CONSTANTS.REACT_QUERY_KEYS.QUERIES]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOnQueryChange = useCallback(
    (value) => {
      if (queryBuilderForm) {
        queryBuilderForm.setFieldValue("pm_query", value);
      }
    },
    [queryBuilderForm]
  );

  const _updateQuery = () => {
    updateQuery(queryBuilderForm.values);
  };

  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row justify-start items-center w-full px-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <SiPostgresql className="!text-4xl" />
        <div className="flex flex-col items-start justify-start p-3 px-4">
          <span className="text-lg font-bold text-start">
            {LOCAL_CONSTANTS.STRINGS.QUERY_UPDATE_PAGE_TITLE}
          </span>
          <span className="text-xs font-medium text-start mt-1">{`Query id : ${id}`}</span>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="query-update-form-panel-sizes"
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
              value={queryBuilderForm.values.pm_query_title}
              onChange={queryBuilderForm.handleChange}
              onBlur={queryBuilderForm.handleBlur}
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
              value={queryBuilderForm.values.pm_query_description}
              onChange={queryBuilderForm.handleChange}
              onBlur={queryBuilderForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Arguments`}</span>
            <ArrayInput
              value={queryBuilderForm.values.pm_query_args}
              onChange={(value) => {
                queryBuilderForm.setFieldValue("pm_query_args", value);
              }}
              type={"text"}
            />
          </FormControl>

          <div className="!flex flex-row justify-end items-center mt-10 w-100 px-3">
            <Button
              variant="contained"
              className="!ml-3"
              onClick={_updateQuery}
            >
              {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
            </Button>
            <QueryDeletionForm id={id} />
            <QueryDuplicateForm id={id} />
          </div>
          <div className="!mt-10 px-3">
            <Tip tip={query_variable_usage_tip}></Tip>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={40} className="w-full !h-full">
          <PGSQLQueryBuilder
            pmQueryID={id}
            value={queryBuilderForm.values.pm_query}
            handleChange={_handleOnQueryChange}
            args={queryBuilderForm.values.pm_query_args}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
