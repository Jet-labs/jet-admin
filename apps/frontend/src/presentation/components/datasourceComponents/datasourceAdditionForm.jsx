import { useFormik } from "formik";
import { X } from 'lucide-react';
import React, { useState, useRef } from "react";
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

import { Button, Spinner, PageHeader } from "@jet-admin/ui";
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
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
      });
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const datasourceAdditionForm = useFormik({
    initialValues: {
      datasourceTitle: "",
      datasourceDescription: "",
      datasourceType: DATASOURCE_TYPES.POSTGRESQL.value, // Default value
      datasourceOptions: datasourceOptionsMetadata.data, // Initialize nested object
    },
    onSubmit: (data) => {
      addDatasource(data);
    },
  });

  return (
    <div className="h-full w-full bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_DATASOURCE_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_DATASOURCE_TITLE}

        onSave={datasourceAdditionForm.handleSubmit}
        isSaving={isAddingDatasource}
        saveText="Save"
      >
        <DatasourceTestingForm
          tenantID={tenantID}
          datasourceType={datasourceAdditionForm.values.datasourceType}
          datasourceOptions={
            datasourceAdditionForm.values.datasourceOptions
          }
          setDatasourceTestResult={setDatasourceTestResult}
        />
      </PageHeader>

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.DATASOURCE_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full"}
      >
        <ResizablePanel
          id={CONSTANTS.RESIZABLE_PANEL_IDS.DATASOURCE_EDITOR_PANEL}
          defaultSize={20}
          className="!overflow-y-auto h-full p-8"
        >
          <div className="mx-auto w-full max-w-2xl">
            <form
              className="space-y-2 w-full"
              onSubmit={datasourceAdditionForm.handleSubmit}
              noValidate
            >
              <DatasourceEditor datasourceEditorForm={datasourceAdditionForm} />

            </form>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.DATASOURCE_RESULT_PANEL} ref={testResultPanelRef} defaultSize={80} collapsible={true} minSize={5}>
          <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="flex items-center justify-between border-b border-border bg-background px-2 py-2 flex-shrink-0">
              <span className="text-xs font-semibold text-foreground">
                Datasource Test Result
              </span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {datasourceTestResult !== undefined && datasourceTestResult !== null ? (
                DATASOURCE_UI_COMPONENTS[
                  datasourceAdditionForm.values.datasourceType
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
    </div>
  );
};
