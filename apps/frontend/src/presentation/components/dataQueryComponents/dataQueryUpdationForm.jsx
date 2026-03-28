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
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_TITLE}
          </h1>
          {dataQuery && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              ID: {dataQuery.dataQueryID}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            datasourceType={queryUpdationForm.values?.datasourceType}
            dataQueryOptions={queryUpdationForm.values?.dataQueryOptions}
            setDataQueryTestResult={setDataQueryTestResult}
            dataQuery={queryUpdationForm.values}
          />

          <Button
            type="submit"
            form="dataquery-update-form"
            size="sm"
            disabled={isUpdatingDataQuery}
          >
            {isUpdatingDataQuery && (
              <Spinner size={14} />
            )}
            {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_SUBMIT_BUTTON}
          </Button>
        </div>
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
          <ResizablePanel defaultSize={20} className="!overflow-y-auto h-full p-3 md:p-6">
            <div className="mx-auto w-full max-w-2xl">
              <form
                id="dataquery-update-form"
                className="space-y-4 w-full"
                onSubmit={queryUpdationForm.handleSubmit}
                noValidate
              >
                <div className="rounded border border-border bg-card p-4 space-y-3">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                    General
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="dataQueryTitle">
                      {CONSTANTS.STRINGS.UPDATE_QUERY_FORM_NAME_FIELD_LABEL} <span className="text-destructive">*</span>
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
                      <p className="text-xs text-red-500">
                        {queryUpdationForm.errors.dataQueryTitle}
                      </p>
                    )}
                  </div>
                </div>

                <DataQueryEditor
                  key={`dataQueryEditor_${dataQuery?.dataQueryID ? dataQuery.dataQueryID : "new"}`}
                  dataQueryEditorForm={queryUpdationForm}
                  tenantID={tenantID}
                  dataQueryID={dataQueryID}
                />
              </form>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <div className="flex h-full w-full flex-col overflow-hidden bg-background">
              <div className="flex items-center justify-between border-b border-border bg-slate-50 px-4 py-2 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-700">
                  Query Test Result
                </span>

              </div>
              <div className="flex-1 overflow-auto">
              {DATASOURCE_UI_COMPONENTS[
                dataQuery?.datasourceType
              ]?.queryResponseView({
                queryResult: dataQueryTestResult,
              })}
            </div>
            </div>

          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
