import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllListenersAPI } from "../../data/apis/listener";

export const useListeners = (tenantID) => {
  const {
    isLoading: isLoadingListeners,
    data: listeners,
    error: loadListenersError,
    isFetching: isFetchingListeners,
    isRefetching: isRefetchingListeners,
    refetch: refetchListeners,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID)],
    queryFn: () => getAllListenersAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    listeners,
    isLoadingListeners,
    isFetchingListeners,
    loadListenersError,
    isRefetchingListeners,
    refetchListeners,
  };
};
