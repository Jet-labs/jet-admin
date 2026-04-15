import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { createWebhookAPI } from "../../../data/apis/webhook";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { WebhookEditor } from "./webhookEditor";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";

export const WebhookAdditionForm = ({ tenantID }) => {
  WebhookAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  const { isPending: isAddingWebhook, mutate: addWebhook } = useMutation({
    mutationFn: (data) =>
      createWebhookAPI({
        tenantID,
        webhookData: data,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.WEBHOOK_ADDED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WEBHOOKS(tenantID),
      ]);
      webhookAdditionForm.resetForm();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const webhookAdditionForm = useFormik({
    initialValues: {
      webhookTitle: "",
      webhookPath: "/",
      authType: "none",
      status: "active",
      authConfig: "{}",
    },
    validationSchema: formValidations.webhookAdditionFormValidationSchema,
    onSubmit: (data) => {
      addWebhook(data);
    },
  });

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_WEBHOOK_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Define a new webhook endpoint.
          </p>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form onSubmit={webhookAdditionForm.handleSubmit} noValidate>
          <WebhookEditor webhookEditorForm={webhookAdditionForm} />

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isAddingWebhook}>
              {isAddingWebhook && <Spinner className="mr-2" size={14} />}
              {CONSTANTS.STRINGS.ADD_WEBHOOK_SUBMIT_BUTTON_TEXT}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
