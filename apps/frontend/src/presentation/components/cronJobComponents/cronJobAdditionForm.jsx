import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { createCronJobAPI } from "../../../data/apis/cronJob";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CronJobEditor } from "./cronJobEditor";
import PropTypes from "prop-types";
import { Button, Spinner, PageHeader } from "@jet-admin/ui";

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
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID)],
      });
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
      workflowConfig: { inputValues: {} },
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
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_CRON_JOB_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_CRON_JOBS_TITLE}
        onSave={cronJobAdditionForm.handleSubmit}
        isSaving={isAddingCronJob}
        saveText="Save"
      />

      {/* ── Form body ───────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form onSubmit={cronJobAdditionForm.handleSubmit} noValidate>
          <CronJobEditor
            tenantID={tenantID}
            cronJobEditorForm={cronJobAdditionForm}
            isLoadingCronJobEditorForm={isAddingCronJob}
          />


        </form>
      </div>
    </section>
  );
};