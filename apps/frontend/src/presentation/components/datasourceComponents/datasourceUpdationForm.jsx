import { useFormik } from "formik";
import { X } from 'lucide-react';
import React, { useEffect, useMemo, useState, useRef } from "react";
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

import { PageHeader } from "@jet-admin/ui";
// --- Original Metadata (only for datasourceOptions) ---
const datasourceOptionsMetadata =
  DATASOURCE_TYPES.POSTGRESQL.formConfig;

const initialValues = {
  datasourceTitle: "",
  datasourceType: DATASOURCE_TYPES.POSTGRESQL.value,
  datasourceOptions: datasourceOptionsMetadata.data,
};

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
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
        });
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const datasourceUpdationForm = useFormik({
    initialValues: datasource ? {
      datasourceTitle: datasource.datasourceTitle || "",
      datasourceType: datasource.datasourceType || DATASOURCE_TYPES.POSTGRESQL.value,
      datasourceOptions: datasource.datasourceOptions || datasourceOptionsMetadata.data,
    } : initialValues,
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
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_DATASOURCE_TITLE}

        id={datasourceID}
        onSave={datasourceUpdationForm.handleSubmit}
        isSaving={isUpdatingDatasource}
      >
        <DatasourceDeletionForm
          tenantID={tenantID}
          datasourceID={datasourceID}
        />
        <DatasourceCloneForm
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
      </PageHeader>
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
            className="!overflow-y-auto h-full p-8"
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
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 flex-shrink-0">
                <span className="text-xs font-semibold text-foreground">
                  Datasource Test Result
                </span>

              </div>
              <div className="flex-1 overflow-auto p-2">
                {datasourceTestResult !== undefined && datasourceTestResult !== null ? (
                  DATASOURCE_UI_COMPONENTS[
                    datasourceUpdationForm.values.datasourceType
                  ]?.datasourceTestResultUI?.({
                    connectionResult: datasourceTestResult,
                  })
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-foreground italic text-sm">
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
