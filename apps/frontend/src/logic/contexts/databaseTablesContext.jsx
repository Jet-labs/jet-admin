import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseTablesAPI } from "../../data/apis/databaseTable";

const DatabaseTablesStateContext = React.createContext(undefined);
const DatabaseTablesActionsContext = React.createContext(undefined);

const DatabaseTablesContextProvider = ({ children }) => {
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingDatabaseTables,
    data: databaseTables,
    error: loadDatabaseTablesError,
    isFetching: isFetchingDatabaseTables,
    isRefetching: isRefetechingDatabaseTables,
    refetch: refetchDatabaseTables,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseTablesAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });

  return (
    <DatabaseTablesStateContext.Provider
      value={{
        databaseTables,
        isLoadingDatabaseTables,
        isFetchingDatabaseTables,
      }}
    >
      <DatabaseTablesActionsContext.Provider value={{ refetchDatabaseTables }}>
        {children}
      </DatabaseTablesActionsContext.Provider>
    </DatabaseTablesStateContext.Provider>
  );
};

const useDatabaseTablesState = () => {
  const context = React.useContext(DatabaseTablesStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseTablesState error");
  }

  return context;
};

const useDatabaseTablesActions = () => {
  const context = React.useContext(DatabaseTablesActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseTablesActions error");
  }

  return context;
};

export {
  DatabaseTablesContextProvider,
  DatabaseTablesActionsContext,
  DatabaseTablesStateContext,
  useDatabaseTablesActions,
  useDatabaseTablesState,
};
