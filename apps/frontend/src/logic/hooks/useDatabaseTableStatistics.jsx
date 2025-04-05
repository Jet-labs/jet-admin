import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getDatabaseTableStatisticsAPI } from "../../data/apis/databaseTable";

export const useDatabaseTableStatistics = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  filterQuery,
}) => {
  const queryClient = useQueryClient();
  const queryKey = [
    CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES_STATISTICS(
      tenantID,
      databaseSchemaName,
      databaseTableName
    ),
    filterQuery,
  ];
  const queryResult = useQuery({
    queryKey: queryKey,
    queryFn: () =>
          getDatabaseTableStatisticsAPI({
            tenantID,
            databaseSchemaName,
            databaseTableName,
            filterQuery: filterQuery,
          }),
    enabled:
      !!tenantID &&
      !!databaseSchemaName &&
      !!databaseTableName,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  return {
    ...queryResult,
    statistics: queryResult.data,
    databaseTableRowCount: queryResult.data?.databaseTableRowCount,
    reloadDatabaseTableRows: queryResult.refetch,
    invalidateDatabaseTableRows: () => {
      queryClient.invalidateQueries(queryKey);
    },
  };
};
