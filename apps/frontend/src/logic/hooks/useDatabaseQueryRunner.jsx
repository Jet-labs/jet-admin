import { useMutation, useQuery } from "@tanstack/react-query";
import { getDatabaseQueryRunnerJobByIDAPI, testDatabaseQueryAPI } from "../../data/apis/databaseQuery";
import { useState } from "react";
import { CONSTANTS } from "../../constants";

// Custom hook for query execution
export const useDatabaseQueryRunner = (tenantID) => {
  const [databaseQueryRunnerJobID, setDatabaseQueryRunnerJobID] = useState(null);

  // Mutation for initial query execution
  const executeQuery = useMutation({
    mutationFn: async ({ databaseQueryID, databaseQueryData }) =>
      testDatabaseQueryAPI({
        tenantID,
        databaseQueryID,
        databaseQueryData,
        async: true,
      }),
    onSuccess: (data) => {
      if (data.databaseQueryRunnerJobID)
        setDatabaseQueryRunnerJobID(data.databaseQueryRunnerJobID);
    },
  });

  // Query for polling status
  const databaseQueryRunnerJobStatus = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERY_RUNNER_JOB_KEYS(tenantID),
      databaseQueryRunnerJobID,
    ],
    queryFn: () =>
      getDatabaseQueryRunnerJobByIDAPI({ tenantID, databaseQueryRunnerJobID }),
    enabled: !!databaseQueryRunnerJobID,
    refetchInterval: (query) =>
      query.state.data?.databaseQueryRunnerJobStatus ===
      CONSTANTS.BACKEND_JOB_STATUS.PROCESSING
        ? 2000
        : false,
    retry: false,
  });

  return {
    execute: executeQuery.mutateAsync,
    status: {
      isIdle: executeQuery.isIdle,
      isExecuting: executeQuery.isPending,
      isPolling: databaseQueryRunnerJobStatus.isFetching,
      data: databaseQueryRunnerJobStatus.data,
      error: executeQuery.error || databaseQueryRunnerJobStatus.error,
    },
    reset: () => {
      executeQuery.reset();
      setDatabaseQueryRunnerJobID(null);
    },
  };
};
