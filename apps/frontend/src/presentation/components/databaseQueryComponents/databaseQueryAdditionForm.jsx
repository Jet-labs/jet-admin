import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useState } from "react";
import "react-data-grid/lib/styles.css";
// import { addQueryAPI } from "../../../api/queries";
import { CONSTANTS } from "../../../constants";

// import { ArrayInput } from "../../ArrayInputComponent";
import { createDatabaseQueryAPI } from "../../../data/apis/databaseQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseQueryTestingForm } from "./databaseQueryTestingForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { formValidations } from "../../../utils/formValidation";
import { DatabaseQueryAIGeneratePrompt } from "./databaseQueryAIGeneratePrompt";
import PropTypes from "prop-types";
import { DatabaseQueryEditor } from "./databaseQueryEditor";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

export const DatabaseQueryAdditionForm = ({ tenantID }) => {
  DatabaseQueryAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const [databaseQueryTestResult, setDatabaseQueryTestResult] = useState();

  const { isPending: isAddingDatabaseQuery, mutate: addDatabaseQuery } =
    useMutation({
      mutationFn: (data) => {
        return createDatabaseQueryAPI({
          tenantID,
          databaseQueryData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.ADD_QUERY_FORM_QUERY_ADDITION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const queryAdditionForm = useFormik({
    initialValues: {
      databaseQueryTitle: "Untitled",
      datasourceID: "",
      datasourceType: "",
      databaseQueryOptions: {},
      runOnLoad: false,
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.queryAdditionFormValidationSchema,
    onSubmit: (values) => {
      addDatabaseQuery(values);
    },
  });

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.ADD_QUERY_FORM_TITLE}
      </h1>
      <ResizablePanelGroup
        direction="vertical"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full border-t border-gray-200"}
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
                className="space-y-3 md:space-y-4  p-3"
              >
                <div>
                  <label
                    htmlFor="databaseQueryTitle"
                    className="block mb-1 text-xs font-medium text-slate-500"
                  >
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_LABEL}
                  </label>
                  {queryAdditionForm.errors.databaseQueryTitle && (
                    <span className="text-red-500 text-xs">
                      {queryAdditionForm.errors.databaseQueryTitle}
                    </span>
                  )}
                  <input
                    type="databaseQueryTitle"
                    name="databaseQueryTitle"
                    id="databaseQueryTitle"
                    className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                    placeholder={
                      CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                    }
                    required={true}
                    onChange={queryAdditionForm.handleChange}
                    onBlur={queryAdditionForm.handleBlur}
                    value={queryAdditionForm.values.databaseQueryTitle}
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="runOnLoad"
                    checked={queryAdditionForm.values.runOnLoad}
                    onChange={queryAdditionForm.handleChange}
                    className="accent-[#646cff] w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_RUN_ON_LOAD_FIELD_LABEL}
                  </span>
                </label>
              </ResizablePanel>
              <ResizableHandle withHandle={true} />
              <ResizablePanel
                defaultSize={80}
                className="space-y-3 md:space-y-4 p-3 h-full w-full !overflow-y-auto"
              >
                <DatabaseQueryEditor
                  databaseQueryEditorForm={queryAdditionForm}
                />
                <div className="w-full flex flex-row justify-end">
                  <DatabaseQueryAIGeneratePrompt
                    tenantID={tenantID}
                    onAccepted={(aiGeneratedQuery) => {
                      queryAdditionForm.setFieldValue(
                        "databaseQueryOptions",
                        aiGeneratedQuery
                      );
                    }}
                  />
                  <DatabaseQueryTestingForm
                    tenantID={tenantID}
                    datasourceID={queryAdditionForm.values.datasourceID}
                    datasourceType={queryAdditionForm.values.datasourceType}
                    databaseQueryOptions={
                      queryAdditionForm.values.databaseQueryOptions
                    }
                    setDatabaseQueryTestResult={setDatabaseQueryTestResult}
                  />
                  <button
                    type="submit"
                    disabled={isAddingDatabaseQuery}
                    className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
                  >
                    {isAddingDatabaseQuery && (
                      <CircularProgress
                        className="!mr-3"
                        size={16}
                        color="white"
                      />
                    )}
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_SUBMIT_BUTTON}
                  </button>
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
            queryResult: databaseQueryTestResult,
          })}
          {/* <DatabaseQueryResponseView
            databaseQueryResult={databaseQueryTestResult}
          /> */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
