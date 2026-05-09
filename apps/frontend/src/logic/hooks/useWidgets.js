import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWidgetsAPI } from "../../data/apis/widget";

export const useWidgets = (tenantID) => {
  const {
    isLoading: isLoadingWidgets,
    data: widgets,
    error: loadWidgetsError,
    isFetching: isFetchingWidgets,
    isRefetching: isRefetchingWidgets,
    refetch: refetchWidgets,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
    queryFn: () => getAllWidgetsAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    widgets,
    isLoadingWidgets,
    isFetchingWidgets,
    loadWidgetsError,
    isRefetchingWidgets,
    refetchWidgets,
  };
};
