import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
import PropTypes from "prop-types";
import { getDatabaseMetadataAPI } from "../../data/apis/database";

const DatabaseQueriesStateContext = React.createContext(undefined);
const DatabaseQueriesActionsContext = React.createContext(undefined);
const DatabaseQueriesContextProvider = ({ children }) => {
  DatabaseQueriesContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();

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

  const {
    isLoading: isLoadingDatabaseMetadata,
    isFetching: isFetchingDatabaseMetadata,
    isRefetching: isRefetchingDatabaseMetadata,
    data: databaseMetadata,
    error: databaseMetadataError,
    refetch: refetchDatabaseMetadata,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: parseInt(tenantID) }),
    refetchOnWindowFocus: false,
  });

  return (
    <DatabaseQueriesStateContext.Provider
      value={{
        databaseQueries,
        isLoadingDatabaseQueries,
        isFetchingDatabaseQueries,
        loadDatabaseQueriesError,
        isRefetechingDatabaseQueries,
        databaseMetadata,
        isLoadingDatabaseMetadata,
        isFetchingDatabaseMetadata,
        databaseMetadataError,
        isRefetchingDatabaseMetadata,
      }}
    >
      <DatabaseQueriesActionsContext.Provider
        value={{ refetchDatabaseQueries , refetchDatabaseMetadata}}
      >
        {children}
      </DatabaseQueriesActionsContext.Provider>
    </DatabaseQueriesStateContext.Provider>
  );
};

const useDatabaseQueriesState = () => {
  const context = React.useContext(DatabaseQueriesStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseQueriesState error");
  }

  return context;
};

const useDatabaseQueriesActions = () => {
  const context = React.useContext(DatabaseQueriesActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseQueriesActions error");
  }

  return context;
};

export {
  DatabaseQueriesActionsContext, DatabaseQueriesContextProvider, DatabaseQueriesStateContext,
  useDatabaseQueriesActions,
  useDatabaseQueriesState
};

