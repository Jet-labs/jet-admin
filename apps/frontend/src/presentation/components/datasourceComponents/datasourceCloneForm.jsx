import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const DatasourceCloneForm = ({ tenantID, datasourceID }) => {
  DatasourceCloneForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    datasourceID: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningDatasource, mutate: cloneDatasource } = useMutation(
    {
      mutationFn: () => {
        return cloneDatasourceByIDAPI({
          tenantID,
          datasourceID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.CLONE_DATASOURCE_CLONING_SUCCESS);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
        });
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );

  const _handleCloneDatasource = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_DIALOG_TITLE || "Clone Datasource",
      message: CONSTANTS.STRINGS.CLONE_DIALOG_MESSAGE || "Are you sure you want to clone this datasource?",
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneDatasource();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        onClick={_handleCloneDatasource}
        disabled={isCloningDatasource}
        aria-label="Clone datasource"
      >
        {isCloningDatasource ? (
          <Spinner size={14} />
        ) : (
            <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
