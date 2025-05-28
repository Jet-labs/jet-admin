import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";
import { getAllCronJobsAPI } from "../../data/apis/cronJob";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";
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
    isLoading: isLoadingDataQueries,
    data: dataQueries,
    error: loadDataQueriesError,
    isFetching: isFetchingDataQueries,
    isRefetching: isRefetechingDataQueries,
    refetch: refetchDataQueries,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID)],
    queryFn: () => getAllDataQueriesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <CronJobsStateContext.Provider
      value={{
        cronJobs,
        isLoadingCronJobs,
        isFetchingCronJobs,
        dataQueries,
        isLoadingDataQueries,
        isFetchingDataQueries,
        loadDataQueriesError,
        loadCronJobsError,
        isRefetechingCronJobs,
        isRefetechingDataQueries,
      }}
    >
      <CronJobsActionsContext.Provider
        value={{ refetchCronJobs, refetchDataQueries }}
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
