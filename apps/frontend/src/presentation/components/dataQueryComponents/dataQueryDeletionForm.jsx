import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";

export const DataQueryDeletionForm = ({ tenantID, dataQueryID }) => {
  DataQueryDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingDataQuery, mutate: deleteDataQuery } =
    useMutation({
      mutationFn: () => {
        return deleteDataQueryByIDAPI({
          tenantID,
          dataQueryID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DELETE_QUERY_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteQuery = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_QUERY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_QUERY_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteDataQuery();
  };

  return (
    <>
      <Button
        variant="destructive-ghost"
        size="sm"
        square
        onClick={_handleDeleteQuery}
        disabled={isDeletingDataQuery}
        type="button"
      >
        {isDeletingDataQuery ? (
          <Spinner size={14} />
        ) : (
            <MdDeleteOutline className="size-4" />
        )}
      </Button>
    </>
  );
};
