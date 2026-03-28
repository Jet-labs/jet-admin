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
    mutationFn: (data) =>
      createCronJobAPI({
        tenantID,
        cronJobData: data,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CRON_JOB_ADDED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID),
      ]);
      cronJobAdditionForm.resetForm();
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
      workflowID: "",
      workflowConfig: { inputArgs: {} },
      isDisabled: false,
      timeoutSeconds: "",
      retryAttempts: "",
      retryDelaySeconds: "",
    },
    validationSchema: formValidations.cronJobAdditionFormValidationSchema,
    onSubmit: (data) => {
      addCronJob(data);
    },
  });

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_CRON_JOB_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Define a new scheduled job and attach it to a workflow.
          </p>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form onSubmit={cronJobAdditionForm.handleSubmit} noValidate>
          <CronJobEditor
            tenantID={tenantID}
            cronJobEditorForm={cronJobAdditionForm}
            isLoadingCronJobEditorForm={isAddingCronJob}
          />

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isAddingCronJob}>
              {isAddingCronJob && <Spinner className="mr-2" size={14} />}
              {CONSTANTS.STRINGS.ADD_CRON_JOB_SUBMIT_BUTTON_TEXT}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};