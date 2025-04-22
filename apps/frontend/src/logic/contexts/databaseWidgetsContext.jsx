import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import { getAllDatabaseWidgetsAPI } from "../../data/apis/databaseWidget";
import PropTypes from "prop-types";

const DatabaseWidgetsStateContext = React.createContext(undefined);
const DatabaseWidgetsActionsContext = React.createContext(undefined);
const DatabaseWidgetsContextProvider = ({ children }) => {
  DatabaseWidgetsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingDatabaseWidgets,
    data: databaseWidgets,
    error: loadDatabaseWidgetsError,
    isFetching: isFetchingDatabaseWidgets,
    isRefetching: isRefetechingDatabaseWidgets,
    refetch: refetchDatabaseWidgets,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID)],
    queryFn: () => getAllDatabaseWidgetsAPI({ tenantID }),
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
    <DatabaseWidgetsStateContext.Provider
      value={{
        databaseWidgets,
        isLoadingDatabaseWidgets,
        isFetchingDatabaseWidgets,
        loadDatabaseWidgetsError,
        loadDatabaseQueriesError,
        isRefetechingDatabaseWidgets,
        isRefetechingDatabaseQueries,
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

