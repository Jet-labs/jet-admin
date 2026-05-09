import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatasourcesAPI } from "../../data/apis/datasource";

export const useDatasources = (tenantID) => {
  const {
    isLoading: isLoadingDatasources,
    data: datasources,
    error: loadDatasourcesError,
    isFetching: isFetchingDatasources,
    isRefetching: isRefetchingDatasources,
    refetch: refetchDatasources,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
    queryFn: () => getAllDatasourcesAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    datasources,
    isLoadingDatasources,
    isFetchingDatasources,
    loadDatasourcesError,
    isRefetchingDatasources,
    refetchDatasources,
  };
};
