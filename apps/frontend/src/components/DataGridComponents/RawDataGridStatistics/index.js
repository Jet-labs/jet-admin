import { useNavigate } from "react-router-dom";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTableStatsAPI } from "../../../api/tables";
import { useAuthState } from "../../../contexts/authContext";

import { Grid, useTheme } from "@mui/material";
import { LOCAL_CONSTANTS } from "../../../constants";
import { Loading } from "../../../pages/Loading";
import { ErrorComponent } from "../../ErrorComponent";
import { useEffect } from "react";
import { generateFilterQuery } from "../../../utils/postgresUtils/tables";

export const RawDataGridStatistics = ({
  tableName,
  altTableName,
  filterQuery,
  setRowCount,
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
      `${LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName)}_STATS`,
      filterQuery,
    ],
    queryFn: () =>
      fetchTableStatsAPI({
        tableName,
        filterQuery: generateFilterQuery(filterQuery),
      }),

    enabled: Boolean(pmUser),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data && data.statistics && setRowCount) {
      setRowCount(data.statistics.rowCount);
    }
  }, [data]);

  const _handleReloadData = () => {
    queryClient.invalidateQueries([
      `${LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID(tableName)}_STATS`,
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
