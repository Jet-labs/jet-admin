import { useMutation, useQuery } from "@tanstack/react-query";
import { getDatabaseChartRunnerJobByIDAPI, testDatabaseChartAPI } from "../../data/apis/databaseChart";
import { useState } from "react";
import { CONSTANTS } from "../../constants";

// Custom hook for query execution
export const useDatabaseChartRunner = (tenantID) => {
  const [databaseChartRunnerJobID, setDatabaseChartRunnerJobID] = useState(null);

  // Mutation for initial query execution
  const executeChart = useMutation({
    mutationFn: async ({ databaseChartID, databaseChartData }) =>
      testDatabaseChartAPI({
        tenantID,
        databaseChartID,
        databaseChartData,
        async: true,
      }),
    onSuccess: (data) => {
      if (data.databaseChartRunnerJobID)
        setDatabaseChartRunnerJobID(data.databaseChartRunnerJobID);
    },
  });

  // Chart for polling status
  const databaseChartRunnerJobStatus = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERY_RUNNER_JOB_KEYS(tenantID),
      databaseChartRunnerJobID,
    ],
    queryFn: () =>
      getDatabaseChartRunnerJobByIDAPI({ tenantID, databaseChartRunnerJobID }),
    enabled: !!databaseChartRunnerJobID,
    refetchInterval: (query) =>
      query.state.data?.databaseChartRunnerJobStatus ===
      CONSTANTS.BACKEND_JOB_STATUS.PROCESSING
        ? 2000
        : false,
    retry: false,
  });

  return {
    execute: executeChart.mutateAsync,
    status: {
      isIdle: executeChart.isIdle,
      isExecuting: executeChart.isPending,
      isPolling: databaseChartRunnerJobStatus.isFetching,
      data: databaseChartRunnerJobStatus.data,
      error: executeChart.error || databaseChartRunnerJobStatus.error,
    },
    reset: () => {
      executeChart.reset();
      setDatabaseChartRunnerJobID(null);
    },
  };
};
