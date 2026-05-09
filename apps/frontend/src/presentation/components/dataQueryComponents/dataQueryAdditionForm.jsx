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
    <div className="flex h-full w-full flex-col items-center bg-brand-dark">
      <div className="w-full flex items-center justify-between border-b border-border bg-brand-dark px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_QUERY_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure a new data query connection.
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
        <ResizablePanel defaultSize={20} className="!overflow-y-auto h-full p-3 md:p-6">
          <div className="mx-auto w-full max-w-2xl">
            <form
              className="space-y-4 w-full"
              onSubmit={queryAdditionForm.handleSubmit}
              noValidate
            >
              <div className="rounded-sm border border-border bg-card p-4 space-y-3">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                  General
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="dataQueryTitle">
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_LABEL} <span className="text-destructive">*</span>
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
                    <p className="text-xs text-red-500">
                      {queryAdditionForm.errors.dataQueryTitle}
                    </p>
                  )}
                </div>
              </div>

              <DataQueryEditor dataQueryEditorForm={queryAdditionForm} tenantID={tenantID} />

              <div className="w-full flex justify-end items-center gap-2 mt-4">
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
                    <Spinner size={14} />
                  )}
                  {CONSTANTS.STRINGS.ADD_QUERY_FORM_SUBMIT_BUTTON}
                </Button>
              </div>
            </form>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={80}>
          <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
            <div className="flex items-center justify-between border-b border-border bg-brand-dark px-4 py-2 flex-shrink-0">
              <span className="text-xs font-semibold text-brand-text-primary">
                Query Test Result
              </span>

            </div>
            <div className="flex-1 overflow-auto">
          {DATASOURCE_UI_COMPONENTS[
            queryAdditionForm.values.datasourceType
          ]?.queryResponseView({
            queryResult: dataQueryTestResult,
          })}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
