import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseChartByIDAPI } from "../../../data/apis/databaseChart";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
export const DatabaseChartDeletionForm = ({
  tenantID,
  databaseChartID,
}) => {
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingDatabaseChart,
    isSuccess: isDeletingDatabaseChartSuccess,
    isError: isDeletingDatabaseChartError,
    error: deleteDatabaseChartError,
    mutate: deleteDatabaseChart,
  } = useMutation({
    mutationFn: (data) => {
      return deleteDatabaseChartByIDAPI({
        tenantID,
        databaseChartID,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_CHART_DELETION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(
          tenantID
        ),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteChart = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_CHART_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_CHART_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseChart();
  };

  return (
    <>
      <button
        onClick={_handleDeleteChart}
        disabled={isDeletingDatabaseChart}
        type="button"
        class="flex flex-row items-center justify-center rounded bg-red-50 ms-2 px-1 py-1 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingDatabaseChart ? (
          <CircularProgress className="!text-xs" size={16} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
