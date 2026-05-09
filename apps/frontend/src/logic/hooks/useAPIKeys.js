import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllAPIKeysAPI } from "../../data/apis/apiKey";

export const useAPIKeys = (tenantID) => {
  const {
    isLoading: isLoadingAPIKeys,
    data: apiKeys,
    error: loadAPIKeysError,
    isFetching: isFetchingAPIKeys,
    isRefetching: isRefetchingAPIKeys,
    refetch: refetchAPIKeys,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID)],
    queryFn: () => getAllAPIKeysAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    apiKeys,
    isLoadingAPIKeys,
    isFetchingAPIKeys,
    isRefetchingAPIKeys,
    refetchAPIKeys,
    loadAPIKeysError,
  };
};
