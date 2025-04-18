import {
  CircularProgress
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";

import { createCronJobAPI } from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CronJobEditor } from "./cronJobEditor";

export const CronJobAdditionForm = ({tenantID}) => {
  const queryClient = useQueryClient();
  
    const {
      isPending: isAddingCronJob,
      isSuccess: isAddingCronJobSuccess,
      isError: isAddingCronJobError,
      error: addCronJobError,
      mutate: addCronJob,
    } = useMutation({
      mutationFn: (data) => {
        return createCronJobAPI({
          tenantID,
          cronJobData: data,
        });
      },
      retry: false,
      onSuccess: (data) => {
        displaySuccess(
          CONSTANTS.STRINGS.CRON_JOB_ADDED_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });
    const cronJobAdditionForm = useFormik({
      initialValues: {
        cronJobTitle: "",
        cronJobDescription: "",
        cronJobSchedule: "",
        databaseQueryID: "",
      },
      validationSchema: formValidations.cronJobAdditionFormValidationSchema,
      onSubmit: (data) => {
        addCronJob(data);
      },
    });
  
    console.log({ cronJobAdditionForm });

  return (
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl  p-3">
        {CONSTANTS.STRINGS.ADD_CRON_JOB_FORM_TITLE}
      </h1>

      <form
        class="space-y-3 md:space-y-4 mt-2 p-3"
        onSubmit={cronJobAdditionForm.handleSubmit}
      >
        <CronJobEditor
          tenantID={tenantID}
          cronJobEditorForm={cronJobAdditionForm}
          isLoadingCronJobEditorForm={isAddingCronJob}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            class="flex ml-2 flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            disabled={isAddingCronJob}
          >
            {isAddingCronJob ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              CONSTANTS.STRINGS.ADD_CRON_JOB_SUBMIT_BUTTON_TEXT
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
