import { useFormik } from "formik";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import {
  getDatasourceByIDAPI,
  updateDatasourceAPI,
} from "../../../data/apis/datasource";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { DatasourceEditor } from "./datasourceEditor";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DatasourceTestingForm } from "./datasourceTestingForm";
import { DatasourceDeletionForm } from "./datasourceDeletionForm";
import { DatasourceCloneForm } from "./datasourceCloneForm";

import { Button, Spinner } from "@jet-admin/ui";
// --- Original Metadata (only for datasourceOptions) ---
const datasourceOptionsMetadata =
  DATASOURCE_TYPES.POSTGRESQL.formConfig;

export const DatasourceUpdationForm = ({ tenantID, datasourceID }) => {
  DatasourceUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    datasourceID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();
  const [datasourceTestResult, setDatasourceTestResult] = useState();
  const testResultPanelRef = useRef(null);

  const {
    isLoading: isLoadingDatasource,
    data: datasource,
    error: loadDatasourceError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), datasourceID],
    queryFn: () =>
      getDatasourceByIDAPI({
        tenantID,
        datasourceID,
      }),
    refetchOnWindowFocus: false,
  });

  console.log("datasource", datasource);

  const { isPending: isUpdatingDatasource, mutate: updateDatasource } =
    useMutation({
      mutationFn: (data) => {
        // 'data' here will be the complete form object from Formik
        return updateDatasourceAPI({
          tenantID,
          datasourceID,
          ...data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_DATASOURCE_ADDITION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  // Derive initial values from fetched datasource
  const initialValues = useMemo(() => ({
    datasourceTitle: datasource?.datasourceTitle || "",
    datasourceType: datasource?.datasourceType || "postgresql",
    datasourceOptions: datasource?.datasourceOptions || datasourceOptionsMetadata.data,
  }), [datasource]);

  console.log("initialValues", initialValues);

  const datasourceUpdationForm = useFormik({
    initialValues,
    enableReinitialize: true, // Re-initialize form when datasource changes
    onSubmit: (data) => {
      updateDatasource(data);
    },
  });

  // Reset test result when switching to a different datasource
  useEffect(() => {
    setDatasourceTestResult(undefined);
  }, [datasourceID]);

  return (
    <div className="h-full w-full bg-background">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_TITLE}
          </h1>
          {datasource && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              ID: {datasource.datasourceID}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DatasourceCloneForm
            tenantID={tenantID}
            datasourceID={datasourceID}
          />

          <DatasourceDeletionForm
            tenantID={tenantID}
            datasourceID={datasourceID}
          />
          <DatasourceTestingForm
            tenantID={tenantID}
            datasourceType={datasourceUpdationForm.values.datasourceType}
            datasourceOptions={
              datasourceUpdationForm.values.datasourceOptions
            }
            setDatasourceTestResult={setDatasourceTestResult}
            key={`datasourceTestingForm_${datasource?.datasourceID}`}
          />
          <Button
            type="submit"
            form="datasource-update-form"
            size="sm"
            disabled={isUpdatingDatasource}
          >
            {isUpdatingDatasource && (
              <Spinner size={14} />
            )}
            {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_SUBMIT_BUTTON}
          </Button>
        </div>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatasource}
        error={loadDatasourceError}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel
            defaultSize={20}
            className="!overflow-y-auto h-full p-3 md:p-6"
          >
            <div className="mx-auto w-full max-w-2xl">
              <form
                id="datasource-update-form"
                className="space-y-4 w-full"
                onSubmit={datasourceUpdationForm.handleSubmit}
                noValidate
              >
                <DatasourceEditor datasourceEditorForm={datasourceUpdationForm} key={`datasourceEditor_${datasource?.datasourceID}`} />
              </form>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel ref={testResultPanelRef} defaultSize={80} collapsible={true} minSize={5}>
            <div className="flex h-full w-full flex-col overflow-hidden bg-background">
              <div className="flex items-center justify-between border-b border-border bg-slate-50 px-4 py-2 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-700">
                  Datasource Test Result
                </span>

              </div>
              <div className="flex-1 overflow-auto p-4">
                {datasourceTestResult !== undefined && datasourceTestResult !== null ? (
                  DATASOURCE_UI_COMPONENTS[
                    datasourceUpdationForm.values.datasourceType
                  ]?.datasourceTestResultUI?.({
                    connectionResult: datasourceTestResult,
                  })
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500 italic text-sm">
                    Test the connection to see results here.
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
