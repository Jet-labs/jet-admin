import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getDatabaseQueryByIDAPI,
  updateDatabaseQueryByIDAPI,
} from "../../../data/apis/databaseQuery";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ArrayInput } from "../ui/arrayInputField";
import { DatabaseQueryDeletionForm } from "./databaseQueryDeletionForm";
import { DatabaseQueryResponseView } from "./databaseQueryResponseView";
import { DatabaseQueryTestingForm } from "./databaseQueryTestingForm";
import { PGSQLQueryEditor } from "./pgsqlQueryEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DatabaseQueryCloneForm } from "./databaseQueryCloneForm";

export const DatabaseQueryUpdationForm = ({ tenantID, databaseQueryID }) => {
  DatabaseQueryUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseQueryID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [databaseQueryTestResult, setDatabaseQueryTestResult] = useState();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDatabaseQuery,
    data: databaseQuery,
    error: loadDatabaseQueryError,
    isFetching: isFetchingDatabaseQuery,
    isRefetching: isRefetechingDatabaseQuery,
    refetch: refetchDatabaseQuery,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      databaseQueryID,
    ],
    queryFn: () =>
      getDatabaseQueryByIDAPI({
        tenantID,
        databaseQueryID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingDatabaseQuery, mutate: updateDatabaseQuery } =
    useMutation({
      mutationFn: (data) => {
        return updateDatabaseQueryByIDAPI({
          tenantID,
          databaseQueryID,
          databaseQueryData: {
            ...data,
            databaseQueryData: {
              databaseQueryString: data.databaseQueryString,
              databaseQueryArgs: data.databaseQueryArgs,
            },
          },
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_QUERY_FORM_QUERY_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const queryUpdationForm = useFormik({
    initialValues: {
      databaseQueryTitle: "Untitled",
      databaseQueryDescription: "",
      databaseQueryString: "",
      databaseQueryArgs: [],
      runOnLoad: false,
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.queryUpdationFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-[#646cff]",
      });
      updateDatabaseQuery(values);
    },
  });

  // Use useEffect to update Formik values when databaseQuery is fetched
  useEffect(() => {
    if (databaseQuery) {
      // Update Formik form values with the fetched databaseQuery data
      queryUpdationForm.setFieldValue(
        "databaseQueryTitle",
        databaseQuery.databaseQueryTitle || CONSTANTS.STRINGS.UNTITLED
      );
      queryUpdationForm.setFieldValue(
        "databaseQueryDescription",
        databaseQuery.databaseQueryDescription || ""
      );
      queryUpdationForm.setFieldValue(
        "databaseQueryString",
        databaseQuery.databaseQueryData.databaseQueryString || ""
      );
      queryUpdationForm.setFieldValue(
        "databaseQueryArgs",
        databaseQuery.databaseQueryData.databaseQueryArgs || []
      );
      queryUpdationForm.setFieldValue(
        "runOnLoad",
        databaseQuery.runOnLoad || false
      );
    }
  }, [databaseQuery]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700 text-start ">
          {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_TITLE}
        </h1>

        {databaseQuery && (
          <span className="text-xs text-[#646cff] mt-2">{`Query ID: ${
            databaseQuery.databaseQueryID
          } | ${
            databaseQuery.linkedDatabaseWidgetCount > 0
              ? `Used in ${databaseQuery.linkedDatabaseWidgetCount} ${
                  databaseQuery.linkedDatabaseWidgetCount > 1
                    ? "widgets"
                    : "widget"
                } `
              : `Not used in any widget`
          }`}</span>
        )}
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatabaseQuery}
        isFetching={isFetchingDatabaseQuery}
        isRefetching={isRefetechingDatabaseQuery}
        refetch={refetchDatabaseQuery}
        error={loadDatabaseQueryError}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel defaultSize={20}>
            <form
              className="w-full h-full "
              onSubmit={queryUpdationForm.handleSubmit}
            >
              <ResizablePanelGroup
                direction="horizontal"
                autoSaveId={
                  CONSTANTS.RESIZABLE_PANEL_KEYS
                    .QUERY_ADDITION_FORM_QUERY_EDITOR_SEPARATION
                }
                className={"!w-full !h-full"}
              >
                <ResizablePanel
                  defaultSize={20}
                  className="space-y-3 md:space-y-4 p-3 !overflow-y-auto"
                >
                  <div>
                    <label
                      htmlFor="databaseQueryTitle"
                      className="block mb-1 text-xs font-medium text-slate-500"
                    >
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_NAME_FIELD_LABEL}
                    </label>
                    <input
                      type="databaseQueryTitle"
                      name="databaseQueryTitle"
                      id="databaseQueryTitle"
                      className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                      placeholder={
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                      }
                      required={true}
                      onChange={queryUpdationForm.handleChange}
                      onBlur={queryUpdationForm.handleBlur}
                      value={queryUpdationForm.values.databaseQueryTitle}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="databaseQueryDescription"
                      className="block mb-1 text-xs font-medium text-slate-500"
                    >
                      {
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_DESCRIPTION_FIELD_LABEL
                      }
                    </label>
                    <input
                      type="databaseQueryDescription"
                      name="databaseQueryDescription"
                      id="databaseQueryDescription"
                      className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                      placeholder={
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_DESCRIPTION_FIELD_PLACEHOLDER
                      }
                      onChange={queryUpdationForm.handleChange}
                      onBlur={queryUpdationForm.handleBlur}
                      value={queryUpdationForm.values.databaseQueryDescription}
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="runOnLoad"
                      checked={queryUpdationForm.values.runOnLoad}
                      onChange={queryUpdationForm.handleChange}
                      className="accent-[#646cff] w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_RUN_ON_LOAD_FIELD_LABEL
                      }
                    </span>
                  </label>
                  <div>
                    <label
                      htmlFor="databaseQueryArgs"
                      className="block mb-1 text-xs font-medium text-slate-500"
                    >
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_PARAMS_FIELD_LABEL}
                    </label>
                    <ArrayInput
                      key={"databaseQueryArgs"}
                      id={"databaseQueryArgs"}
                      value={queryUpdationForm.values.databaseQueryArgs}
                      onChange={(value) => {
                        queryUpdationForm.setFieldValue(
                          "databaseQueryArgs",
                          value
                        );
                      }}
                      type={"text"}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle={true} />
                <ResizablePanel
                  defaultSize={80}
                  className="space-y-3 md:space-y-4 p-3"
                >
                  <PGSQLQueryEditor
                    code={queryUpdationForm.values.databaseQueryString}
                    setCode={(value) => {
                      console.log({ value });
                      queryUpdationForm.setFieldValue(
                        "databaseQueryString",
                        value
                      );
                    }}
                    language={"pgsql"}
                  />
                  <div className="w-full flex flex-row justify-end">
                    <DatabaseQueryCloneForm
                      key={`databaseQueryCloneForm_${databaseQuery?.databaseQueryID}`}
                      tenantID={tenantID}
                      databaseQueryID={databaseQueryID}
                    />
                    <DatabaseQueryDeletionForm
                      key={`databaseQueryDeletionForm_${databaseQuery?.databaseQueryID}`}
                      tenantID={tenantID}
                      databaseQueryID={databaseQueryID}
                    />
                    <DatabaseQueryTestingForm
                      key={`databaseQueryTestingForm_${databaseQuery?.databaseQueryID}`}
                      tenantID={tenantID}
                      databaseQueryID={databaseQueryID}
                      databaseQueryString={
                        queryUpdationForm.values.databaseQueryString
                      }
                      databaseQueryArgs={
                        queryUpdationForm.values.databaseQueryArgs
                      }
                      setDatabaseQueryTestResult={setDatabaseQueryTestResult}
                    />

                    <button
                      type="submit"
                      disabled={isUpdatingDatabaseQuery}
                      className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
                    >
                      {isUpdatingDatabaseQuery && (
                        <CircularProgress
                          className="!mr-3"
                          size={16}
                          color="white"
                        />
                      )}
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_SUBMIT_BUTTON}
                    </button>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <DatabaseQueryResponseView
              databaseQueryResult={databaseQueryTestResult}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
