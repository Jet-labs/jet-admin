import { useFormik } from "formik";
import React, { useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { createDatasourceAPI } from "../../../data/apis/datasource";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { DatasourceTestingForm } from "./datasourceTestingForm";

import { Button, Spinner } from "@jet-admin/ui";
// --- Original Metadata (only for datasourceOptions) ---
const datasourceOptionsMetadata =
  DATASOURCE_TYPES.POSTGRESQL.formConfig;

export const DatasourceAdditionForm = ({ tenantID }) => {
  DatasourceAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();
  const [datasourceTestResult, setDatasourceTestResult] = useState();
  const testResultPanelRef = useRef(null);

  const { isPending: isAddingDatasource, mutate: addDatasource } = useMutation({
    mutationFn: (data) => {
      // 'data' here will be the complete form object from Formik
      return createDatasourceAPI({
        tenantID,
        ...data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.ADD_DATASOURCE_FORM_DATASOURCE_ADDITION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const datasourceAdditionForm = useFormik({
    initialValues: {
      datasourceTitle: "",
      datasourceDescription: "",
      datasourceType: "postgresql", // Default value
      datasourceOptions: datasourceOptionsMetadata.initialData, // Initialize nested object
    },
    onSubmit: (data) => {
      addDatasource(data);
    },
  });

  return (
    <div className="h-full w-full bg-brand-dark">
      <div className="w-full flex items-center justify-between border-b border-border bg-brand-dark px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_DATASOURCE_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure a new data source connection.
          </p>
        </div>
      </div>

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
              className="space-y-4 w-full"
              onSubmit={datasourceAdditionForm.handleSubmit}
              noValidate
            >
              <DatasourceEditor datasourceEditorForm={datasourceAdditionForm} />
              <div className="flex flex-row justify-end items-center gap-3 mt-4">
                <DatasourceTestingForm
                  tenantID={tenantID}
                  datasourceType={datasourceAdditionForm.values.datasourceType}
                  datasourceOptions={
                    datasourceAdditionForm.values.datasourceOptions
                  }
                  setDatasourceTestResult={setDatasourceTestResult}
                />
                <Button
                  type="submit"
                  disabled={isAddingDatasource}
                >
                  {isAddingDatasource && (
                    <Spinner size={14} />
                  )}
                  {CONSTANTS.STRINGS.ADD_DATASOURCE_BUTTON_TEXT}
                </Button>
              </div>
            </form>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel ref={testResultPanelRef} defaultSize={80} collapsible={true} minSize={5}>
          <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
            <div className="flex items-center justify-between border-b border-border bg-brand-dark px-4 py-2 flex-shrink-0">
              <span className="text-xs font-semibold text-brand-text-primary">
                Datasource Test Result
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {datasourceTestResult !== undefined && datasourceTestResult !== null ? (
                DATASOURCE_UI_COMPONENTS[
                  datasourceAdditionForm.values.datasourceType
                ]?.datasourceTestResultUI?.({
                  connectionResult: datasourceTestResult,
                })
              ) : (
                <div className="h-full w-full flex items-center justify-center text-brand-text-primary italic text-sm">
                  Test the connection to see results here.
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
