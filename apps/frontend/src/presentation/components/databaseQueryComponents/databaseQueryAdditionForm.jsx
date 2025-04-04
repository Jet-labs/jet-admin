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
import { ArrayInput } from "../ui/arrayInputField";
import { DatabaseQueryResponseView } from "./databaseQueryResponseView";
import { DatabaseQueryTestingForm } from "./databaseQueryTestingForm";
import { PGSQLQueryEditor } from "./pgsqlQueryEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { formValidations } from "../../../utils/formValidation";
import { da } from "@faker-js/faker";

export const DatabaseQueryAdditionForm = ({ tenantID }) => {
  const queryClient = useQueryClient();
  const [databaseQueryTestResult, setDatabaseQueryTestResult] = useState();

  const {
    isPending: isAddingDatabaseQuery,
    isSuccess: isAddingDatabaseQuerySuccess,
    isError: isAddingDatabaseQueryError,
    error: addDatabaseQueryError,
    mutate: addDatabaseQuery,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseQueryAPI({
        tenantID,
        databaseQueryData: {
          ...data,
          databaseQueryData: {
            databaseQueryString: data.databaseQueryString,
            databaseQueryArgs: data.databaseQueryArgs,
          },
        },
      });
    },
    retry: false,
    onSuccess: (data) => {
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
      databaseQueryDescription: "",
      databaseQueryString: "",
      databaseQueryArgs: [],
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
          <form class="w-full h-full" onSubmit={queryAdditionForm.handleSubmit}>
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
                    for="databaseQueryTitle"
                    class="block mb-1 text-xs font-medium text-slate-500"
                  >
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_LABEL}
                  </label>
                  <input
                    type="databaseQueryTitle"
                    name="databaseQueryTitle"
                    id="databaseQueryTitle"
                    class=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                    placeholder={
                      CONSTANTS.STRINGS.ADD_QUERY_FORM_NAME_FIELD_PLACEHOLDER
                    }
                    required={true}
                    onChange={queryAdditionForm.handleChange}
                    onBlur={queryAdditionForm.handleBlur}
                    value={queryAdditionForm.values.databaseQueryTitle}
                  />
                </div>
                <div>
                  <label
                    for="databaseQueryDescription"
                    class="block mb-1 text-xs font-medium text-slate-500"
                  >
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_DESCRIPTION_FIELD_LABEL}
                  </label>
                  <input
                    type="databaseQueryDescription"
                    name="databaseQueryDescription"
                    id="databaseQueryDescription"
                    class=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                    placeholder={
                      CONSTANTS.STRINGS
                        .ADD_QUERY_FORM_DESCRIPTION_FIELD_PLACEHOLDER
                    }
                    onChange={queryAdditionForm.handleChange}
                    onBlur={queryAdditionForm.handleBlur}
                    value={queryAdditionForm.values.databaseQueryDescription}
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
                <div>
                  <label
                    for="databaseQueryDescription"
                    class="block mb-1 text-xs font-medium text-slate-500"
                  >
                    {CONSTANTS.STRINGS.ADD_QUERY_FORM_PARAMS_FIELD_LABEL}
                  </label>
                  <ArrayInput
                    value={queryAdditionForm.values.databaseQueryArgs}
                    onChange={(value) => {
                      queryAdditionForm.setFieldValue(
                        "databaseQueryArgs",
                        value
                      );
                    }}
                    type={"text"}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle={true} />
              <ResizablePanel
                defaultSize={80}
                className="space-y-3 md:space-y-4 p-3"
              >
                <PGSQLQueryEditor
                  code={queryAdditionForm.values.databaseQueryString}
                  setCode={(value) => {
                    console.log({ value });
                    queryAdditionForm.setFieldValue(
                      "databaseQueryString",
                      value
                    );
                  }}
                  language={"pgsql"}
                />
                <div className="w-full flex flex-row justify-end">
                  <DatabaseQueryTestingForm
                    tenantID={tenantID}
                    databaseQueryString={
                      queryAdditionForm.values.databaseQueryString
                    }
                    databaseQueryArgs={
                      queryAdditionForm.values.databaseQueryArgs
                    }
                    setDatabaseQueryTestResult={setDatabaseQueryTestResult}
                  />
                  <button
                    type="submit"
                    disabled={isAddingDatabaseQuery}
                    class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
                  >
                    {isAddingDatabaseQuery && (
                      <CircularProgress
                        className="!text-xs !mr-3"
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
          <DatabaseQueryResponseView
            databaseQueryTestResult={databaseQueryTestResult}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
