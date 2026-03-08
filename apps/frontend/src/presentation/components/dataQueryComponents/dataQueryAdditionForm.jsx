import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useState } from "react";
import "react-data-grid/lib/styles.css";
import { CONSTANTS } from "../../../constants";
import { createDataQueryAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryTestingForm } from "./dataQueryTestingForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { formValidations } from "../../../utils/formValidation";
import { DataQueryAIGeneratePrompt } from "./dataQueryAIGeneratePrompt";
import PropTypes from "prop-types";
import { DataQueryEditor } from "./dataQueryEditor";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

import { Button, Spinner, Input, Label } from "@jet-admin/ui";

export const DataQueryAdditionForm = ({ tenantID }) => {
  DataQueryAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const [dataQueryTestResult, setDataQueryTestResult] = useState();

  const { isPending: isAddingDataQuery, mutate: addDataQuery } = useMutation({
    mutationFn: (data) => {
      return createDataQueryAPI({
        tenantID,
        dataQueryData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_QUERY_FORM_QUERY_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const queryAdditionForm = useFormik({
    initialValues: {
      dataQueryTitle: "Untitled",
      datasourceID: "",
      datasourceType: "",
      dataQueryOptions: {},
      runOnLoad: false,
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.queryAdditionFormValidationSchema,
    onSubmit: (values) => {
      addDataQuery(values);
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <div className="w-full border-b border-border bg-background px-3 py-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-start">
          {CONSTANTS.STRINGS.ADD_QUERY_FORM_TITLE}
        </h1>
      </div>
      <ResizablePanelGroup
        direction="vertical"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full"}
      >
        <ResizablePanel defaultSize={20}>
          <form
            className="w-full h-full"
            onSubmit={queryAdditionForm.handleSubmit}
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
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_LABEL}
                  </Label>
                  <Input
                    name="dataQueryTitle"
                    id="dataQueryTitle"
                    placeholder={
                      CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                    }
                    required={true}
                    onChange={queryAdditionForm.handleChange}
                    onBlur={queryAdditionForm.handleBlur}
                    value={queryAdditionForm.values.dataQueryTitle}
                  />
                  {queryAdditionForm.errors.dataQueryTitle && (
                    <span className="text-destructive text-xs">
                      {queryAdditionForm.errors.dataQueryTitle}
                    </span>
                  )}
                </div>

              </ResizablePanel>
              <ResizableHandle withHandle={true} />
              <ResizablePanel
                defaultSize={80}
                className="space-y-4 p-3 h-full w-full !overflow-y-auto"
              >
                <DataQueryEditor dataQueryEditorForm={queryAdditionForm} />
                <div className="w-full flex flex-row justify-end items-center gap-3">
                  <DataQueryAIGeneratePrompt
                    tenantID={tenantID}
                    onAccepted={(aiGeneratedQuery) => {
                      queryAdditionForm.setFieldValue(
                        "dataQueryOptions",
                        aiGeneratedQuery
                      );
                    }}
                  />
                  <DataQueryTestingForm
                    tenantID={tenantID}
                    datasourceID={queryAdditionForm.values.datasourceID}
                    datasourceType={queryAdditionForm.values.datasourceType}
                    dataQueryOptions={queryAdditionForm.values.dataQueryOptions}
                    setDataQueryTestResult={setDataQueryTestResult}
                    dataQuery={queryAdditionForm.values}
                  />
                  <Button type="submit" disabled={isAddingDataQuery}>
                    {isAddingDataQuery && (
                      <Spinner className="mr-2" size={16} />
                    )}
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_SUBMIT_BUTTON}
                  </Button>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80}>
          {DATASOURCE_UI_COMPONENTS[
            queryAdditionForm.values.datasourceType
          ]?.queryResponseView({
            queryResult: dataQueryTestResult,
          })}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
