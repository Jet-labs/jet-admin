import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useMemo, useState } from "react";
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

import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

import { Button, Spinner, Input, Label } from "@jet-admin/ui";

export const DataQueryUpdationForm = ({ tenantID, dataQueryID }) => {
  DataQueryUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    dataQueryID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const [dataQueryTestResult, setDataQueryTestResult] = useState();
  const { showConfirmation } = useGlobalUI();

  const {
    isLoading: isLoadingDataQuery,
    data: dataQuery,
    error: loadDataQueryError,
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

  // Derive initial values from fetched data query
  const initialValues = useMemo(() => ({
    dataQueryTitle: dataQuery?.dataQueryTitle || "Untitled",
    datasourceID: dataQuery?.datasourceID || "",
    datasourceType: dataQuery?.datasourceType || "",
    dataQueryOptions: dataQuery?.dataQueryOptions || {},
    runOnLoad: dataQuery?.runOnLoad || false,
  }), [dataQuery]);

  const queryUpdationForm = useFormik({
    initialValues,
    enableReinitialize: true, // Re-initialize form when dataQuery changes
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.queryUpdationFormValidationSchema,
    onSubmit: async (values) => {
      await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-primary",
      });
      updateDataQuery(values);
    },
  });

  // Reset test result when switching to a different data query
  React.useEffect(() => {
    setDataQueryTestResult(undefined);
  }, [dataQueryID]);

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <div className="w-full px-3 py-2 border-b border-border flex flex-col justify-center items-start">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-start ">
          {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_TITLE}
        </h1>

        {dataQuery && (
          <span className="text-xs text-muted-foreground mt-1">{`Query ID: ${
            dataQuery.dataQueryID
          }`}</span>
        )}
      </div>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDataQuery}
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
                  className="space-y-4 p-3 !overflow-y-auto"
                >
                  <div className="space-y-1">
                    <Label
                      htmlFor="dataQueryTitle"
                      className="text-sm font-medium leading-none"
                    >
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_NAME_FIELD_LABEL}
                    </Label>
                    <Input
                      name="dataQueryTitle"
                      id="dataQueryTitle"
                      placeholder={
                        CONSTANTS.STRINGS
                          .UPDATE_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                      }
                      required={true}
                      onChange={queryUpdationForm.handleChange}
                      onBlur={queryUpdationForm.handleBlur}
                      value={queryUpdationForm.values.dataQueryTitle}
                    />
                    {queryUpdationForm.errors.dataQueryTitle && (
                      <span className="text-destructive text-xs">
                        {queryUpdationForm.errors.dataQueryTitle}
                      </span>
                    )}
                  </div>

                </ResizablePanel>
                <ResizableHandle withHandle={true} />
                <ResizablePanel
                  defaultSize={80}
                  className="space-y-4 p-3 h-full w-full !overflow-y-auto"
                >
                  <DataQueryEditor
                    key={`dataQueryEditor_${dataQuery?.dataQueryID}`}
                    dataQueryEditorForm={queryUpdationForm}
                    tenantID={tenantID}
                    dataQueryID={dataQueryID}
                  />
                  <div className="w-full flex flex-row justify-end items-center gap-3">
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
                      dataQuery={queryUpdationForm.values}
                    />

                    <Button
                      type="submit"
                      disabled={isUpdatingDataQuery}
                    >
                      {isUpdatingDataQuery && (
                        <Spinner className="mr-2" size={16} />
                      )}
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_SUBMIT_BUTTON}
                    </Button>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <div className="w-full h-full">
              {DATASOURCE_UI_COMPONENTS[
                dataQuery?.datasourceType
              ]?.queryResponseView({
                queryResult: dataQueryTestResult,
              })}
            </div>

          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
