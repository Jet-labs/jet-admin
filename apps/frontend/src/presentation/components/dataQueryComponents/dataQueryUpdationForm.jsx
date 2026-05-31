import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useMemo, useState } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import {
  getDataQueryByIDAPI,
  updateDataQueryByIDAPI,
} from "../../../data/apis/dataQuery";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
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
import { useDatasourceOptions } from "../../../logic/hooks/useDatasourceOptions";

import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

import { Input, Label, PageHeader } from "@jet-admin/ui";

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

  const { isLoadingDatasources, loadDatasourcesError } = useDatasourceOptions(tenantID);

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
    datasourceID: String(dataQuery?.datasourceID || dataQuery?.datasourceType || ""),
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
      const confirmed = await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_QUERY_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "!bg-primary",
      });
      if (!confirmed) return;
      updateDataQuery(values);
    },
  });

  // Reset test result when switching to a different data query
  React.useEffect(() => {
    setDataQueryTestResult(undefined);
  }, [dataQueryID]);

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_QUERY_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_QUERIES_TITLE}

        id={dataQueryID}
        onSave={queryUpdationForm.handleSubmit}
        isSaving={isUpdatingDataQuery}
      >
        <DataQueryDeletionForm
          key={`dataQueryDeletionForm_${dataQuery?.dataQueryID}`}
          tenantID={tenantID}
          dataQueryID={dataQueryID}
        />
        <DataQueryCloneForm
          key={`dataQueryCloneForm_${dataQuery?.dataQueryID}`}
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
      </PageHeader>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDataQuery || isLoadingDatasources}
        error={loadDataQueryError || loadDatasourcesError}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel defaultSize={20} className="!overflow-y-auto h-full p-8">
            <div className="mx-auto w-full max-w-2xl">
              <form
                id="dataquery-update-form"
                className="space-y-4 w-full"
                onSubmit={queryUpdationForm.handleSubmit}
                noValidate
              >
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
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 flex-shrink-0">
                <span className="text-xs font-semibold text-foreground">
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
