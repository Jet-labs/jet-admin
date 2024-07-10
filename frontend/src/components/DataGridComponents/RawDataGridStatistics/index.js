import { useNavigate } from "react-router-dom";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTableStatsAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";

import { Grid, useTheme } from "@mui/material";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useConstants } from "../../../contexts/constantsContext";
import { Loading } from "../../../pages/Loading";
import { displayError } from "../../../utils/notification";
import { ErrorComponent } from "../../ErrorComponent";

export const RawDataGridStatistics = ({
  tableName,
  altTableName,
  filterQuery,
}) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    isLoading: isLoadingData,
    data: data,
    isError: isLoadDataError,
    error: loadDataError,
    isFetching: isFetchingAllData,
    isPreviousData: isPreviousDataData,
  } = useQuery({
    queryKey: [
      `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}_STATS`,
      filterQuery,
    ],
    queryFn: () =>
      fetchTableStatsAPI({
        tableName,
        filterQuery: filterQuery,
      }),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: Infinity,
    keepPreviousData: true,
  });

  const _handleReloadData = () => {
    queryClient.invalidateQueries([
      `REACT_QUERY_KEY_TABLES_${String(tableName).toUpperCase()}_STATS`,
    ]);
  };

  return isLoadingData ? (
    <Loading />
  ) : data?.statistics && pmUser ? (
    <Grid container columnSpacing={2} rowSpacing={1} className="!mb-4">
      <Grid item xs={12}>
        <span
          className="!text-xl !font-bold"
          style={{ color: theme.palette.primary.contrastText }}
        >
          {altTableName ? altTableName : `${tableName}`}
        </span>
      </Grid>
      <Grid item xs={12}>
        <span className="!text-sm !font-thin !text-slate-400">{`Total records : ${data.statistics.rowCount}`}</span>
      </Grid>
    </Grid>
  ) : (
    // <div className="!w-full !p-4">{JSON.stringify(data.statistics)}</div>
    <div className="!w-full !p-4">
      <ErrorComponent
        error={loadDataError || LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR}
      />
    </div>
  );
};
