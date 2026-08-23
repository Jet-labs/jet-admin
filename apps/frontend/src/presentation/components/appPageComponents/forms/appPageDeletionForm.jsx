import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { deleteAppPageByIDAPI } from "../../../../data/apis/appPage";
import { useGlobalUI } from "../../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";

export const AppPageDeletionForm = ({ tenantID, appPageID }) => {
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingAppPage, mutate: deleteAppPage } =
    useMutation({
      mutationFn: () => {
        return deleteAppPageByIDAPI({
          tenantID,
          appPageID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DELETE_APP_PAGE_DELETION_SUCCESS);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
        });
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteAppPage = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_APP_PAGE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_APP_PAGE_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteAppPage();
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      square
      className="shrink-0"
      aria-label="Delete app page"
      onClick={_handleDeleteAppPage}
      disabled={isDeletingAppPage}
    >
      {isDeletingAppPage ? (
        <Spinner size={16} />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
    </Button>
  );
};

AppPageDeletionForm.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
