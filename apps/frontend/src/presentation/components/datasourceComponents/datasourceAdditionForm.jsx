import { useFormik } from "formik";
import React, { useState } from "react";
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
    <div className="h-full w-full bg-background">
      <div className="border-b border-border bg-background p-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.ADD_DATASOURCE_FORM_TITLE}
        </h1>
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
          className="!overflow-y-auto h-full p-3"
        >
          <form
            className="space-y-4 w-full"
            onSubmit={datasourceAdditionForm.handleSubmit}
          >
            <DatasourceEditor datasourceEditorForm={datasourceAdditionForm} />
            <div className="flex flex-row justify-end items-center gap-3">
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
                  <Spinner className="mr-2" size={16} />
                )}
                {CONSTANTS.STRINGS.ADD_DATASOURCE_BUTTON_TEXT}
              </Button>
            </div>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80}>
          {datasourceTestResult !== undefined && datasourceTestResult !== null
            ? DATASOURCE_UI_COMPONENTS[
                datasourceAdditionForm.values.datasourceType
            ]?.datasourceTestResultUI?.({
                connectionResult: datasourceTestResult,
              })
            : null}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
