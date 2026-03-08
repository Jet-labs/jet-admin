import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
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

  const _handleCloneDatasource = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_DIALOG_TITLE || "Clone Datasource",
      message: CONSTANTS.STRINGS.CLONE_DIALOG_MESSAGE || "Are you sure you want to clone this datasource?",
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    cloneDatasource();
  };

  return (
    <>
      <Button
        onClick={_handleCloneDatasource}
        disabled={isCloningDatasource}
        type="button"
        variant="primary-ghost"
        size="icon"
      >
        {isCloningDatasource ? (
          <Spinner size={16} />
        ) : (
            <FaRegClone className="size-4 text-primary" />
        )}
      </Button>
    </>
  );
};
