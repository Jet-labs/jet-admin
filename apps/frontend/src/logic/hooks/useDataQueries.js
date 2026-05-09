import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";

export const useDataQueries = (tenantID) => {
  const {
    isLoading: isLoadingDataQueries,
    data: dataQueries,
    error: loadDataQueriesError,
    isFetching: isFetchingDataQueries,
    isRefetching: isRefetchingDataQueries,
    refetch: refetchDataQueries,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID)],
    queryFn: () => getAllDataQueriesAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    dataQueries,
    isLoadingDataQueries,
    isFetchingDataQueries,
    loadDataQueriesError,
    isRefetchingDataQueries,
    refetchDataQueries,
  };
};
