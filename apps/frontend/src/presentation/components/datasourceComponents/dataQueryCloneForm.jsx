import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneDatasourceByIDAPI } from "../../../data/apis/datasource";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

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
      title: CONSTANTS.STRINGS.CLONE_DATASOURCE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_DATASOURCE_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-[#646cff]",
    });
    cloneDatasource();
  };

  return (
    <>
      <button
        onClick={_handleCloneDatasource}
        disabled={isCloningDatasource}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff]/50 hover:bg-[#646cff]/20 outline-none focus:outline-none hover:border-[#646cff]"
      >
        {isCloningDatasource ? (
          <CircularProgress size={16} color="white" />
        ) : (
          <FaRegClone className="text-xl text-[#646cff] hover:text-[#646cff]" />
        )}
      </button>
    </>
  );
};
