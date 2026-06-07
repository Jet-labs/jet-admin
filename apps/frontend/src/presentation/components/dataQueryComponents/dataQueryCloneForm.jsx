import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const DataQueryCloneForm = ({ tenantID, dataQueryID }) => {
  DataQueryCloneForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningDataQuery, mutate: cloneDataQuery } = useMutation(
    {
      mutationFn: () => {
        return cloneDataQueryByIDAPI({
          tenantID,
          dataQueryID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.CLONE_QUERY_CLONING_SUCCESS);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID)],
        });
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );

  const _handleCloneQuery = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneDataQuery();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        onClick={_handleCloneQuery}
        disabled={isCloningDataQuery}
        className="shrink-0"
        aria-label="Clone query"
      >
        {isCloningDataQuery ? (
          <Spinner size={14} />
        ) : (
            <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
