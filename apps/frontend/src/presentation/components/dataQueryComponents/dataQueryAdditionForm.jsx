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

import { Button, Spinner, Input, Label, PageHeader } from "@jet-admin/ui";

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
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_QUERY_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_QUERIES_TITLE}

        onSave={queryAdditionForm.handleSubmit}
        isSaving={isAddingDataQuery}
        saveText="Save"
      >
        <DataQueryTestingForm
          tenantID={tenantID}
          datasourceID={queryAdditionForm.values.datasourceID}
          datasourceType={queryAdditionForm.values.datasourceType}
          dataQueryOptions={queryAdditionForm.values.dataQueryOptions}
          setDataQueryTestResult={setDataQueryTestResult}
          dataQuery={queryAdditionForm.values}
        />
      </PageHeader>
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
              className="space-y-2 w-full"
              onSubmit={queryAdditionForm.handleSubmit}
              noValidate
            >


              <DataQueryEditor dataQueryEditorForm={queryAdditionForm} tenantID={tenantID} />


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
