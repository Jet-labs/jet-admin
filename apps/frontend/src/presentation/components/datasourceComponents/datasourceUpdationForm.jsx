import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
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
      <div className="border-b border-border bg-background p-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_TITLE}
        </h1>
        {datasource && (
          <span className="mt-1 block text-xs text-muted-foreground">
            {`Datasource ID: ${datasource.datasourceID}`}
          </span>
        )}
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
            className="!overflow-y-auto h-full p-3"
          >
            <form
              className="space-y-4 w-full"
              onSubmit={datasourceUpdationForm.handleSubmit}
            >
              <DatasourceEditor datasourceEditorForm={datasourceUpdationForm} key={`datasourceEditor_${datasource?.datasourceID}`} />
              <div className="flex flex-row justify-end items-center gap-3">
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
                  disabled={isUpdatingDatasource}
                >
                  {isUpdatingDatasource && (
                    <Spinner className="mr-2" size={16} />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_SUBMIT_BUTTON}
                </Button>
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            {datasourceTestResult !== undefined && datasourceTestResult !== null
              ? DATASOURCE_UI_COMPONENTS[
                  datasourceUpdationForm.values.datasourceType
                ]?.datasourceTestResultUI({
                  connectionResult: datasourceTestResult,
                })
              : null}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
