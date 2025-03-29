import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteAPIKeyByIDAPI } from "../../../data/apis/apiKey";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
export const APIKeyDeletionForm = ({ tenantID, apiKeyID }) => {
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingAPIKey,
    isSuccess: isDeletingAPIKeySuccess,
    isError: isDeletingAPIKeyError,
    error: deleteAPIKeyError,
    mutate: deleteAPIKey,
  } = useMutation({
    mutationFn: (data) => {
      return deleteAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_API_KEY_DELETION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteNotification = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteAPIKey();
  };

  return (
    <>
      <button
        onClick={_handleDeleteNotification}
        disabled={isDeletingAPIKey}
        type="button"
        class="flex flex-row items-center justify-center rounded bg-red-50 mr-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingAPIKey ? (
          <CircularProgress className="!text-xs" size={20} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
