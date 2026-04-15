import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteSubscriptionByIDAPI } from "../../../data/apis/subscription";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";
import { Button, Spinner } from "@jet-admin/ui";

export const SubscriptionDeletionForm = ({ tenantID, subscriptionID }) => {
  SubscriptionDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    subscriptionID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();

  const { isPending: isDeletingSubscription, mutate: deleteSubscription } =
    useMutation({
      mutationFn: () =>
        deleteSubscriptionByIDAPI({
          tenantID,
          subscriptionID,
        }),
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.SUBSCRIPTION_DELETED_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.SUBSCRIPTIONS(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteClick = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_SUBSCRIPTION_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_SUBSCRIPTION_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;
    deleteSubscription();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="sm"
      square
      onClick={_handleDeleteClick}
      disabled={isDeletingSubscription}
      type="button"
      className="shrink-0"
      aria-label="Delete subscription"
    >
      {isDeletingSubscription ? (
        <Spinner size={14} />
      ) : (
        <MdDeleteOutline className="h-4 w-4" />
      )}
    </Button>
  );
};
