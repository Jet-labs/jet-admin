import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import { getAllDatabaseWidgetsAPI } from "../../data/apis/databaseWidget";
const DatabaseWidgetsStateContext = React.createContext(undefined);
const DatabaseWidgetsActionsContext = React.createContext(undefined);
const DatabaseWidgetsContextProvider = ({ children }) => {
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingDatabaseWidgets,
    data: databaseWidgets,
    error: loadDatabaseWidgetsError,
    isFetching: isFetchingDatabaseWidgets,
    isRefetching: isRefetechingDatabaseWidgets,
    refetch: refetchDatabaseWidgets,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseWidgetsAPI({ tenantID, databaseSchemaName }),
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
    <DatabaseWidgetsStateContext.Provider
      value={{
        databaseWidgets,
        isLoadingDatabaseWidgets,
        isFetchingDatabaseWidgets,

        databaseQueries,
        isLoadingDatabaseQueries,
        isFetchingDatabaseQueries,
      }}
    >
      <DatabaseWidgetsActionsContext.Provider
        value={{ refetchDatabaseWidgets, refetchDatabaseQueries }}
      >
        {children}
      </DatabaseWidgetsActionsContext.Provider>
    </DatabaseWidgetsStateContext.Provider>
  );
};

const useDatabaseWidgetsState = () => {
  const context = React.useContext(DatabaseWidgetsStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseWidgetsState error");
  }

  return context;
};

const useDatabaseWidgetsActions = () => {
  const context = React.useContext(DatabaseWidgetsActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseWidgetsActions error");
  }

  return context;
};

export {
  DatabaseWidgetsActionsContext, DatabaseWidgetsContextProvider, DatabaseWidgetsStateContext,
  useDatabaseWidgetsActions,
  useDatabaseWidgetsState
};

