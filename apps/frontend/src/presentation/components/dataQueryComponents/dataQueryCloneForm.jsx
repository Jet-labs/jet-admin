import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
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
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );

  const _handleCloneQuery = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    cloneDataQuery();
  };

  return (
    <>
      <Button
        onClick={_handleCloneQuery}
        disabled={isCloningDataQuery}
        type="button"
        variant="primary-ghost"
        size="icon"
      >
        {isCloningDataQuery ? (
          <Spinner size={16} />
        ) : (
            <FaRegClone className="size-4 text-primary" />
        )}
      </Button>
    </>
  );
};
