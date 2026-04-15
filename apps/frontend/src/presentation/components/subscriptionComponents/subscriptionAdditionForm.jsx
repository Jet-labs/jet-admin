import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { createSubscriptionAPI } from "../../../data/apis/subscription";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { SubscriptionEditor } from "./subscriptionEditor";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";

export const SubscriptionAdditionForm = ({ tenantID }) => {
  SubscriptionAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  const { isPending: isAddingSubscription, mutate: addSubscription } =
    useMutation({
      mutationFn: (data) =>
        createSubscriptionAPI({
          tenantID,
          subscriptionData: data,
        }),
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.SUBSCRIPTION_ADDED_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.SUBSCRIPTIONS(tenantID),
        ]);
        subscriptionAdditionForm.resetForm();
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const subscriptionAdditionForm = useFormik({
    initialValues: {
      subscriptionTitle: "",
      datasourceID: "",
      subscriptionType: "realtime",
      status: "active",
      subscriptionConfig: "{}",
    },
    validationSchema:
      formValidations.subscriptionAdditionFormValidationSchema,
    onSubmit: (data) => {
      addSubscription(data);
    },
  });

  return (
    <section className="w-full bg-background">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_SUBSCRIPTION_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Define a new subscription and attach it to a data source.
          </p>
        </div>
      </div>

      {/* ── Form body ───────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form onSubmit={subscriptionAdditionForm.handleSubmit} noValidate>
          <SubscriptionEditor
            subscriptionEditorForm={subscriptionAdditionForm}
          />

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isAddingSubscription}>
              {isAddingSubscription && (
                <Spinner className="mr-2" size={14} />
              )}
              {CONSTANTS.STRINGS.ADD_SUBSCRIPTION_SUBMIT_BUTTON_TEXT}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
