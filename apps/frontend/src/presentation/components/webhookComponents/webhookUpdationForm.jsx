import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getWebhookByIDAPI,
  updateWebhookByIDAPI,
} from "../../../data/apis/webhook";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { WebhookDeletionForm } from "./webhookDeletionForm";
import { WebhookEditor } from "./webhookEditor";
import { Button, Spinner } from "@jet-admin/ui";

export const WebhookUpdationForm = ({ tenantID, webhookID }) => {
  WebhookUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    webhookID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingWebhook,
    data: webhook,
    error: loadWebhookError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WEBHOOKS(tenantID), webhookID],
    queryFn: () => getWebhookByIDAPI({ tenantID, webhookID }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingWebhook, mutate: updateWebhook } = useMutation({
    mutationFn: (data) =>
      updateWebhookByIDAPI({
        tenantID,
        webhookID,
        webhookData: data,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.WEBHOOK_UPDATED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WEBHOOKS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const webhookUpdationForm = useFormik({
    initialValues: {
      webhookTitle: "",
      webhookPath: "/",
      authType: "none",
      status: "active",
      authConfig: "{}",
    },
    validationSchema: formValidations.webhookUpdationFormValidationSchema,
    onSubmit: (data) => {
      updateWebhook(data);
    },
  });

  // Populate form once the remote data arrives.
  useEffect(() => {
    if (webhook?.webhookID) {
      const configToEdit =
        typeof webhook.authConfig === "object"
          ? JSON.stringify(webhook.authConfig, null, 2)
          : webhook.authConfig ?? "{}";

      webhookUpdationForm.setValues({
        webhookTitle: webhook.webhookTitle ?? "",
        webhookPath: webhook.webhookPath ?? "/",
        authType: webhook.authType ?? "none",
        status: webhook.status ?? "active",
        authConfig: configToEdit,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhook]);

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_WEBHOOK_FORM_TITLE}
          </h1>
          {webhook?.webhookID && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Webhook ID: {webhook.webhookID}
            </p>
          )}
        </div>

        {/* ── Header actions ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <WebhookDeletionForm tenantID={tenantID} webhookID={webhookID} />

          <Button
            type="submit"
            size="sm"
            form="webhook-updation-form"
            disabled={isUpdatingWebhook}
          >
            {isUpdatingWebhook && <Spinner className="mr-2" size={14} />}
            {CONSTANTS.STRINGS.UPDATE_WEBHOOK_SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────── */}
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWebhook}
        error={loadWebhookError}
      >
        <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
          <form
            id="webhook-updation-form"
            onSubmit={webhookUpdationForm.handleSubmit}
            noValidate
          >
            <WebhookEditor webhookEditorForm={webhookUpdationForm} />
          </form>
        </div>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
