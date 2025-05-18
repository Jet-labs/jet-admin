import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDatabaseQueryByIDAPI } from "../../../data/apis/databaseQuery";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

export const DatabaseQueryCloneForm = ({ tenantID, databaseQueryID }) => {
  DatabaseQueryCloneForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseQueryID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningDatabaseQuery, mutate: cloneDatabaseQuery } =
    useMutation({
      mutationFn: () => {
        return cloneDatabaseQueryByIDAPI({
          tenantID,
          databaseQueryID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.CLONE_QUERY_CLONING_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleCloneQuery = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_QUERY_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-[#646cff]",
    });
    cloneDatabaseQuery();
  };

  return (
    <>
      <button
        onClick={_handleCloneQuery}
        disabled={isCloningDatabaseQuery}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff]/50 hover:bg-[#646cff]/20 outline-none focus:outline-none hover:border-[#646cff]"
      >
        {isCloningDatabaseQuery ? (
          <CircularProgress size={16} color="white" />
        ) : (
          <FaRegClone className="text-xl text-[#646cff] hover:text-[#646cff]" />
        )}
      </button>
    </>
  );
};
