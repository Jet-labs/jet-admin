import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneAppPageByIDAPI } from "../../../data/apis/appPage";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const AppPageCloneForm = ({ tenantID, appPageID }) => {
  AppPageCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningAppPage, mutate: cloneAppPage } = useMutation(
    {
      mutationFn: () => {
        return cloneAppPageByIDAPI({
          tenantID,
          appPageID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.CLONE_APP_PAGE_CLONING_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );

  const _handleCloneAppPage = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_APP_PAGE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_APP_PAGE_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    cloneAppPage();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      square
      className="shrink-0"
      aria-label="Clone app page"
      onClick={_handleCloneAppPage}
      disabled={isCloningAppPage}
    >
      {isCloningAppPage ? (
        <Spinner size={16} />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};
