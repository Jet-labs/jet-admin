import {
  CircularProgress
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";

import { createCronJobAPI, getCronJobByIDAPI, updateCronJobAPI } from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CronJobEditor } from "./cronJobEditor";
import { CronJobDeletionForm } from "./cronJobDeletionForm";

export const CronJobUpdationForm = ({tenantID,cronJobID}) => {
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingCronJob,
    data: cronJob,
    error: loadDatabaseChartError,
    isFetching: isFetchingDatabaseChart,
    isRefetching: isRefetechingDatabaseChart,
    refetch: refetchDatabaseChart,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      cronJobID,
    ],
    queryFn: () =>
      getCronJobByIDAPI({
        tenantID,
        cronJobID,
      }),
    refetchOnWindowFocus: false,
  });

  
    const {
      isPending: isUpdatingCronJob,
      isSuccess: isUpdatingCronJobSuccess,
      isError: isUpdatingCronJobError,
      error: updateCronJobError,
      mutate: updateCronJob,
    } = useMutation({
      mutationFn: (data) => {
        return updateCronJobAPI({
          tenantID,
          cronJobID,
          cronJobData: data,
        });
      },
      retry: false,
      onSuccess: (data) => {
        displaySuccess(CONSTANTS.STRINGS.CRON_JOB_UPDATED_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });
    const cronJobUpdationForm = useFormik({
      initialValues: {
        cronJobTitle: "",
        cronJobDescription: "",
        cronJobSchedule: "",
        databaseQueryID: "",
      },
      validationSchema: formValidations.cronJobUpdationFormValidationSchema,
      onSubmit: (data) => {
        updateCronJob(data);
      },
    });

    useEffect(()=>{
      if(cronJob && cronJob.cronJobID){
        cronJobUpdationForm.setValues({
          cronJobTitle: cronJob.cronJobTitle,
          cronJobDescription: cronJob.cronJobDescription,
          cronJobSchedule: cronJob.cronJobSchedule,
          databaseQueryID: cronJob.databaseQueryID,
        })
      }
    },[cronJob])
  

  return (
    <section className="max-w-3xl w-full">
      <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
          {CONSTANTS.STRINGS.UPDATE_CRON_JOB_FORM_TITLE}
        </h1>

        {cronJob && (
          <span className="text-xs text-[#646cff] mt-2">{`Job ID: ${cronJob.cronJobID} `}</span>
        )}
      </div>

      <form
        class="space-y-3 md:space-y-4 mt-2 p-3"
        onSubmit={cronJobUpdationForm.handleSubmit}
      >
        <CronJobEditor
          tenantID={tenantID}
          cronJobEditorForm={cronJobUpdationForm}
          isLoadingCronJobEditorForm={isUpdatingCronJob}
        />

        <div className="flex justify-end">
          <CronJobDeletionForm tenantID={tenantID} cronJobID={cronJobID} />
          <button
            type="submit"
            class="flex ml-2 flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:outline-none "
            disabled={isUpdatingCronJob}
          >
            {isUpdatingCronJob ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              CONSTANTS.STRINGS.UPDATE_CRON_JOB_SUBMIT_BUTTON_TEXT
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
