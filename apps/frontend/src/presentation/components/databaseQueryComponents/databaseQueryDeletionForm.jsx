import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseQueryByIDAPI } from "../../../data/apis/databaseQuery";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
export const DatabaseQueryDeletionForm = ({ tenantID, databaseQueryID }) => {
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingDatabaseQuery,
    isSuccess: isDeletingDatabaseQuerySuccess,
    isError: isDeletingDatabaseQueryError,
    error: deleteDatabaseQueryError,
    mutate: deleteDatabaseQuery,
  } = useMutation({
    mutationFn: (data) => {
      return deleteDatabaseQueryByIDAPI({
        tenantID,
        databaseQueryID,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_QUERY_DELETION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteQuery = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_QUERY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_QUERY_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseQuery();
  };

  return (
    <>
      <button
        onClick={_handleDeleteQuery}
        disabled={isDeletingDatabaseQuery}
        type="button"
        class="flex flex-row items-center justify-center rounded bg-red-50 mr-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingDatabaseQuery ? (
          <CircularProgress className="!text-xs" size={20} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
