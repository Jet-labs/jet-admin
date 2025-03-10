import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import { getAllDatabaseChartsAPI } from "../../data/apis/databaseChart";
const DatabaseChartsStateContext = React.createContext(undefined);
const DatabaseChartsActionsContext = React.createContext(undefined);
const DatabaseChartsContextProvider = ({ children }) => {
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingDatabaseCharts,
    data: databaseCharts,
    error: loadDatabaseChartsError,
    isFetching: isFetchingDatabaseCharts,
    isRefetching: isRefetechingDatabaseCharts,
    refetch: refetchDatabaseCharts,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_CHARTS(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseChartsAPI({ tenantID, databaseSchemaName }),
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
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_QUERIES(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseQueriesAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });
  return (
    <DatabaseChartsStateContext.Provider
      value={{
        databaseCharts,
        isLoadingDatabaseCharts,
        isFetchingDatabaseCharts,

        databaseQueries,
        isLoadingDatabaseQueries,
        isFetchingDatabaseQueries,
      }}
    >
      <DatabaseChartsActionsContext.Provider
        value={{ refetchDatabaseCharts, refetchDatabaseQueries }}
      >
        {children}
      </DatabaseChartsActionsContext.Provider>
    </DatabaseChartsStateContext.Provider>
  );
};

const useDatabaseChartsState = () => {
  const context = React.useContext(DatabaseChartsStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseChartsState error");
  }

  return context;
};

const useDatabaseChartsActions = () => {
  const context = React.useContext(DatabaseChartsActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseChartsActions error");
  }

  return context;
};

export {
  DatabaseChartsActionsContext, DatabaseChartsContextProvider, DatabaseChartsStateContext,
  useDatabaseChartsActions,
  useDatabaseChartsState
};

