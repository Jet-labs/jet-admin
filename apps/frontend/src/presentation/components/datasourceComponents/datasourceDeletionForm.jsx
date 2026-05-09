import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";

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
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_DATASOURCE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_DATASOURCE_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteDatasource();
  };

  return (
    <>
      <Button
        variant="destructive-ghost"
        size="sm"
        square
        onClick={_handleDeleteDatasource}
        disabled={isDeletingDatasource}
        type="button"
      >
        {isDeletingDatasource ? (
          <Spinner size={14} />
        ) : (
            <MdDeleteOutline className="size-4" />
        )}
      </Button>
    </>
  );
};
