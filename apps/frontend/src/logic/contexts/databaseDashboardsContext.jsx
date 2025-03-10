import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import { getAllDatabaseChartsAPI } from "../../data/apis/databaseChart";
import { getAllDatabaseDashboardsAPI } from "../../data/apis/databaseDashboard";
const DatabaseDashboardsStateContext = React.createContext(undefined);
const DatabaseDashboardsActionsContext = React.createContext(undefined);
const DatabaseDashboardsContextProvider = ({ children }) => {
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingDatabaseDashboards,
    data: databaseDashboards,
    error: loadDatabaseDashboardsError,
    isFetching: isFetchingDatabaseDashboards,
    isRefetching: isRefetechingDatabaseDashboards,
    refetch: refetchDatabaseDashboards,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID)],
    queryFn: () => getAllDatabaseDashboardsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });
  const {
    isLoading: isLoadingDatabaseCharts,
    data: databaseCharts,
    error: loadDatabaseChartsError,
    isFetching: isFetchingDatabaseCharts,
    isRefetching: isRefetechingDatabaseCharts,
    refetch: refetchDatabaseCharts,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID)],
    queryFn: () => getAllDatabaseChartsAPI({ tenantID }),
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
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID),
    ],
    queryFn: () => getAllDatabaseQueriesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });
  return (
    <DatabaseDashboardsStateContext.Provider
      value={{
        databaseDashboards,
        isLoadingDatabaseDashboards,
        isFetchingDatabaseDashboards,

        databaseQueries,
        isLoadingDatabaseQueries,
        isFetchingDatabaseQueries,

        databaseCharts,
        isLoadingDatabaseCharts,
        isFetchingDatabaseCharts,
      }}
    >
      <DatabaseDashboardsActionsContext.Provider
        value={{ refetchDatabaseDashboards, refetchDatabaseQueries,refetchDatabaseCharts }}
      >
        {children}
      </DatabaseDashboardsActionsContext.Provider>
    </DatabaseDashboardsStateContext.Provider>
  );
};

const useDatabaseDashboardsState = () => {
  const context = React.useContext(DatabaseDashboardsStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseDashboardsState error");
  }

  return context;
};

const useDatabaseDashboardsActions = () => {
  const context = React.useContext(DatabaseDashboardsActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseDashboardsActions error");
  }

  return context;
};

export {
  DatabaseDashboardsActionsContext, DatabaseDashboardsContextProvider, DatabaseDashboardsStateContext,
  useDatabaseDashboardsActions,
  useDatabaseDashboardsState
};

