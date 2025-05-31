import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getDataQueryByIDAPI,
  updateDataQueryByIDAPI,
} from "../../../data/apis/dataQuery";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryDeletionForm } from "./dataQueryDeletionForm";
import { DataQueryTestingForm } from "./dataQueryTestingForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DataQueryCloneForm } from "./dataQueryCloneForm";
import { DataQueryEditor } from "./dataQueryEditor";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

export const DataQueryUpdationForm = ({ tenantID, dataQueryID }) => {
  DataQueryUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [dataQueryTestResult, setDataQueryTestResult] = useState();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDataQuery,
    data: dataQuery,
    error: loadDataQueryError,
    isFetching: isFetchingDataQuery,
    isRefetching: isRefetechingDataQuery,
    refetch: refetchDataQuery,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), dataQueryID],
    queryFn: () =>
      getDataQueryByIDAPI({
        tenantID,
        dataQueryID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingDataQuery, mutate: updateDataQuery } =
    useMutation({
      mutationFn: (data) => {
        return updateDataQueryByIDAPI({
          tenantID,
          dataQueryID,
          dataQueryData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_QUERY_FORM_QUERY_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const queryUpdationForm = useFormik({
    initialValues: {
      dataQueryTitle: "Untitled",
      datasourceID: "",
      datasourceType: "",
      dataQueryOptions: {},
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
      updateDataQuery(values);
    },
  });

  console.log({ dataQueryTestResult });

  // Use useEffect to update Formik values when dataQuery is fetched
  useEffect(() => {
    if (dataQuery) {
      // Update Formik form values with the fetched dataQuery data
      queryUpdationForm.setFieldValue(
        "dataQueryTitle",
        dataQuery.dataQueryTitle || CONSTANTS.STRINGS.UNTITLED
      );
      queryUpdationForm.setFieldValue(
        "dataQueryOptions",
        dataQuery.dataQueryOptions || {}
      );
      queryUpdationForm.setFieldValue(
        "datasourceID",
        dataQuery.datasourceType === DATASOURCE_TYPES.RESTAPI.value
          ? DATASOURCE_TYPES.RESTAPI.value
          : dataQuery.datasourceID || ""
      );
      queryUpdationForm.setFieldValue(
        "datasourceType",
        dataQuery.datasourceType || DATASOURCE_TYPES.POSTGRESQL.value
      );
      queryUpdationForm.setFieldValue(
        "runOnLoad",
        dataQuery.runOnLoad || false
      );
    }
  }, [dataQuery]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700 text-start ">
          {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_TITLE}
        </h1>

        {dataQuery && (
          <span className="text-xs text-[#646cff] mt-2">{`Query ID: ${
            dataQuery.dataQueryID
          } | ${
            dataQuery.linkedWidgetCount > 0
              ? `Used in ${dataQuery.linkedWidgetCount} ${
                  dataQuery.linkedWidgetCount > 1 ? "widgets" : "widget"
                } `
              : `Not used in any widget`
          }`}</span>
        )}
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDataQuery}
        isFetching={isFetchingDataQuery}
        isRefetching={isRefetechingDataQuery}
        refetch={refetchDataQuery}
        error={loadDataQueryError}
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
                      htmlFor="dataQueryTitle"
                      className="block mb-1 text-xs font-medium text-slate-500"
                    >
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_NAME_FIELD_LABEL}
                    </label>
                    {queryUpdationForm.errors.dataQueryTitle && (
                      <span className="text-red-500 text-xs">
                        {queryUpdationForm.errors.dataQueryTitle}
                      </span>
                    )}
                    <input
                      type="dataQueryTitle"
                      name="dataQueryTitle"
                      id="dataQueryTitle"
                      className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                      placeholder={
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                      }
                      required={true}
                      onChange={queryUpdationForm.handleChange}
                      onBlur={queryUpdationForm.handleBlur}
                      value={queryUpdationForm.values.dataQueryTitle}
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
                </ResizablePanel>
                <ResizableHandle withHandle={true} />
                <ResizablePanel
                  defaultSize={80}
                  className="space-y-3 md:space-y-4 p-3 h-full w-full !overflow-y-auto"
                >
                  <DataQueryEditor dataQueryEditorForm={queryUpdationForm} />
                  <div className="w-full flex flex-row justify-end">
                    <DataQueryCloneForm
                      key={`dataQueryCloneForm_${dataQuery?.dataQueryID}`}
                      tenantID={tenantID}
                      dataQueryID={dataQueryID}
                    />
                    <DataQueryDeletionForm
                      key={`dataQueryDeletionForm_${dataQuery?.dataQueryID}`}
                      tenantID={tenantID}
                      dataQueryID={dataQueryID}
                    />
                    <DataQueryTestingForm
                      key={`dataQueryTestingForm_${dataQuery?.dataQueryID}`}
                      tenantID={tenantID}
                      dataQueryID={dataQueryID}
                      datasourceID={dataQuery?.datasourceID}
                      datasourceType={dataQuery?.datasourceType}
                      dataQueryOptions={dataQuery?.dataQueryOptions}
                      setDataQueryTestResult={setDataQueryTestResult}
                    />

                    <button
                      type="submit"
                      disabled={isUpdatingDataQuery}
                      className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
                    >
                      {isUpdatingDataQuery && (
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
            {DATASOURCE_UI_COMPONENTS[
              dataQuery?.datasourceType
            ]?.queryResponseView({
              queryResult: dataQueryTestResult,
            })}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
