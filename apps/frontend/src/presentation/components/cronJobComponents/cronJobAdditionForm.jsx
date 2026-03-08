import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";

import { createCronJobAPI } from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CronJobEditor } from "./cronJobEditor";
import PropTypes from "prop-types";

import { Button, Spinner } from "@jet-admin/ui";
export const CronJobAdditionForm = ({ tenantID }) => {
  CronJobAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();

  const { isPending: isAddingCronJob, mutate: addCronJob } = useMutation({
    mutationFn: (data) => {
      return createCronJobAPI({
        tenantID,
        cronJobData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CRON_JOB_ADDED_SUCCESS);
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
      cronJobSchedule: "* * * * *",
      dataQueryID: "",
      dataQueryArgValues: {},
    },
    validationSchema: formValidations.cronJobAdditionFormValidationSchema,
    onSubmit: (data) => {
      addCronJob(data);
    },
  });

  return (
    <section className="w-full bg-background">
      <div className="border-b border-border bg-background p-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.ADD_CRON_JOB_FORM_TITLE}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
        <form
          className="space-y-4"
          onSubmit={cronJobAdditionForm.handleSubmit}
        >
          <CronJobEditor
            tenantID={tenantID}
            cronJobEditorForm={cronJobAdditionForm}
            isLoadingCronJobEditorForm={isAddingCronJob}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isAddingCronJob}>
              {isAddingCronJob && <Spinner className="mr-2" size={16} />}
              {CONSTANTS.STRINGS.ADD_CRON_JOB_SUBMIT_BUTTON_TEXT}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
