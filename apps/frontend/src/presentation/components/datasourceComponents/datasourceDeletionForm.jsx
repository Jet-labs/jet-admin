import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

export const DatasourceDeletionForm = ({ tenantID, datasourceID }) => {
  DatasourceDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    datasourceID: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingDatasource, mutate: deleteDatasource } =
    useMutation({
      mutationFn: () => {
        return deleteDatasourceByIDAPI({
          tenantID,
          datasourceID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DELETE_DATASOURCE_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteDatasource = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_DATASOURCE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_DATASOURCE_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatasource();
  };

  return (
    <>
      <button
        onClick={_handleDeleteDatasource}
        disabled={isDeletingDatasource}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 mr-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingDatasource ? (
          <CircularProgress size={16} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
