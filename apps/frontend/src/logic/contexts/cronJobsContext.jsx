import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";
import { getAllCronJobsAPI } from "../../data/apis/cronJob";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import PropTypes from "prop-types";

const CronJobsStateContext = React.createContext(undefined);
const CronJobsActionsContext = React.createContext(undefined);

const CronJobsContextProvider = ({ children }) => {
  CronJobsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingCronJobs,
    data: cronJobs,
    error: loadCronJobsError,
    isFetching: isFetchingCronJobs,
    isRefetching: isRefetechingCronJobs,
    refetch: refetchCronJobs,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS(tenantID)],
    queryFn: () => getAllCronJobsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseQueries,
    data: databaseQueries,
    error: loadDatabaseQueriesError,
    isFetching: isFetchingDatabaseQueries,
    isRefetching: isRefetechingDatabaseQueries,
    refetch: refetchDatabaseQueries,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID)],
    queryFn: () => getAllDatabaseQueriesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <CronJobsStateContext.Provider
      value={{
        cronJobs,
        isLoadingCronJobs,
        isFetchingCronJobs,
        databaseQueries,
        isLoadingDatabaseQueries,
        isFetchingDatabaseQueries,
        loadDatabaseQueriesError,
        loadCronJobsError,
        isRefetechingCronJobs,
        isRefetechingDatabaseQueries,
      }}
    >
      <CronJobsActionsContext.Provider
        value={{ refetchCronJobs, refetchDatabaseQueries }}
      >
        {children}
      </CronJobsActionsContext.Provider>
    </CronJobsStateContext.Provider>
  );
};

const useCronJobsState = () => {
  const context = React.useContext(CronJobsStateContext);
  if (context === undefined) {
    throw new Error("useCronJobsState error");
  }

  return context;
};

const useCronJobsActions = () => {
  const context = React.useContext(CronJobsActionsContext);
  if (context === undefined) {
    throw new Error("useCronJobsActions error");
  }

  return context;
};

export {
  CronJobsActionsContext,
  CronJobsContextProvider,
  CronJobsStateContext,
  useCronJobsActions,
  useCronJobsState,
};
