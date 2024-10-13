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
    retry: 0,
    staleTime: 0,
  });

  const queryUpdateForm = useFormik({
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
    onSubmit: (values) => {
      updateQuery(values);
    },
  });

  useEffect(() => {
    if (queryUpdateForm && queryData) {
      queryUpdateForm.setFieldValue("pm_query_id", queryData.pm_query_id);
      queryUpdateForm.setFieldValue("pm_query_title", queryData.pm_query_title);
      queryUpdateForm.setFieldValue(
        "pm_query_description",
        queryData.pm_query_description
      );
      queryUpdateForm.setFieldValue("pm_query_type", queryData.pm_query_type);
      queryUpdateForm.setFieldValue("pm_query", queryData.pm_query);
      queryUpdateForm.setFieldValue("pm_query_args", queryData.pm_query_args);
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
      if (queryUpdateForm) {
        queryUpdateForm.setFieldValue("pm_query", value);
      }
    },
    [queryUpdateForm]
  );

  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-row justify-between items-center w-full px-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-row justify-start items-center">
          <SiPostgresql className="!text-4xl" />
          <div className="flex flex-col items-start justify-start p-3 px-4">
            <span className="text-lg font-bold text-start">
              {LOCAL_CONSTANTS.STRINGS.QUERY_UPDATE_PAGE_TITLE}
            </span>
            <span className="text-xs font-medium text-start mt-1">{`Query id : ${id}`}</span>
          </div>
        </div>
        <div className="!flex flex-row justify-end items-center">
          <Button
            variant="contained"
            className="!ml-3"
            onClick={queryUpdateForm.handleSubmit}
          >
            {LOCAL_CONSTANTS.STRINGS.UPDATE_BUTTON_TEXT}
          </Button>
          <QueryDeletionForm id={id} />
          <QueryDuplicateForm id={id} />
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
              value={queryUpdateForm.values.pm_query_title}
              onChange={queryUpdateForm.handleChange}
              onBlur={queryUpdateForm.handleBlur}
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
              value={queryUpdateForm.values.pm_query_description}
              onChange={queryUpdateForm.handleChange}
              onBlur={queryUpdateForm.handleBlur}
            />
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Arguments`}</span>
            <ArrayInput
              value={queryUpdateForm.values.pm_query_args}
              onChange={(value) => {
                queryUpdateForm.setFieldValue("pm_query_args", value);
              }}
              type={"text"}
            />
          </FormControl>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={40} className="w-full !h-full">
          <PGSQLQueryBuilder
            pmQueryID={id}
            value={queryUpdateForm.values.pm_query}
            handleChange={_handleOnQueryChange}
            args={queryUpdateForm.values.pm_query_args}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
