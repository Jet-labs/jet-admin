import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getSubscriptionByIDAPI,
  updateSubscriptionByIDAPI,
} from "../../../data/apis/subscription";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { SubscriptionDeletionForm } from "./subscriptionDeletionForm";
import { SubscriptionEditor } from "./subscriptionEditor";
import { Button, Spinner } from "@jet-admin/ui";

export const SubscriptionUpdationForm = ({ tenantID, subscriptionID }) => {
  SubscriptionUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    subscriptionID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingSubscription,
    data: subscription,
    error: loadSubscriptionError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.SUBSCRIPTIONS(tenantID),
      subscriptionID,
    ],
    queryFn: () => getSubscriptionByIDAPI({ tenantID, subscriptionID }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingSubscription, mutate: updateSubscription } =
    useMutation({
      mutationFn: (data) =>
        updateSubscriptionByIDAPI({
          tenantID,
          subscriptionID,
          subscriptionData: data,
        }),
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.SUBSCRIPTION_UPDATED_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.SUBSCRIPTIONS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const subscriptionUpdationForm = useFormik({
    initialValues: {
      subscriptionTitle: "",
      datasourceID: "",
      subscriptionType: "realtime",
      status: "active",
      subscriptionConfig: "{}",
    },
    validationSchema:
      formValidations.subscriptionUpdationFormValidationSchema,
    onSubmit: (data) => {
      updateSubscription(data);
    },
  });

  // Populate form once the remote data arrives.
  useEffect(() => {
    if (subscription?.subscriptionID) {
      const configToEdit =
        typeof subscription.subscriptionConfig === "object"
          ? JSON.stringify(subscription.subscriptionConfig, null, 2)
          : subscription.subscriptionConfig ?? "{}";

      subscriptionUpdationForm.setValues({
        subscriptionTitle: subscription.subscriptionTitle ?? "",
        datasourceID: subscription.datasourceID
          ? String(subscription.datasourceID)
          : "",
        subscriptionType: subscription.subscriptionType ?? "realtime",
        status: subscription.status ?? "active",
        subscriptionConfig: configToEdit,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_SUBSCRIPTION_FORM_TITLE}
          </h1>
          {subscription?.subscriptionID && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Subscription ID: {subscription.subscriptionID}
            </p>
          )}
        </div>

        {/* ── Header actions ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <SubscriptionDeletionForm
            tenantID={tenantID}
            subscriptionID={subscriptionID}
          />

          <Button
            type="submit"
            size="sm"
            form="subscription-updation-form"
            disabled={isUpdatingSubscription}
          >
            {isUpdatingSubscription && (
              <Spinner className="mr-2" size={14} />
            )}
            {CONSTANTS.STRINGS.UPDATE_SUBSCRIPTION_SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────── */}
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingSubscription}
        error={loadSubscriptionError}
      >
        <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
          <form
            id="subscription-updation-form"
            onSubmit={subscriptionUpdationForm.handleSubmit}
            noValidate
          >
            <SubscriptionEditor
              subscriptionEditorForm={subscriptionUpdationForm}
            />
          </form>
        </div>
      </ReactQueryLoadingErrorWrapper>
    </section>
  );
};
