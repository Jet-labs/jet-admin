import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllAppPagesAPI } from "../../data/apis/appPage";

export const useAppPages = (tenantID) => {
  const {
    isLoading: isLoadingAppPages,
    data: appPages,
    error: loadAppPagesError,
    isFetching: isFetchingAppPages,
    isRefetching: isRefetchingAppPages,
    refetch: refetchAppPages,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
    queryFn: () => getAllAppPagesAPI({ tenantID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID),
  });

  return {
    appPages,
    isLoadingAppPages,
    isFetchingAppPages,
    loadAppPagesError,
    isRefetchingAppPages,
    refetchAppPages,
  };
};
