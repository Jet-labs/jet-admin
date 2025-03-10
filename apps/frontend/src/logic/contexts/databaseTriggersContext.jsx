import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseTriggersAPI } from "../../data/apis/databaseTrigger";
const DatabaseTriggersStateContext = React.createContext(undefined);
const DatabaseTriggersActionsContext = React.createContext(undefined);
const DatabaseTriggersContextProvider = ({children}) => {
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingDatabaseTriggers,
    data: databaseTriggers,
    error: loadDatabaseTriggersError,
    isFetching: isFetchingDatabaseTriggers,
    isRefetching: isRefetechingDatabaseTriggers,
    refetch: refetchDatabaseTriggers,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TRIGGERS(
        tenantID,
        databaseSchemaName
      ),
    ],
    queryFn: () => getAllDatabaseTriggersAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });
console.log({databaseTriggers})
  return (
    <DatabaseTriggersStateContext.Provider
      value={{
        databaseTriggers,
        isLoadingDatabaseTriggers,
        isFetchingDatabaseTriggers,
      }}
    >
      <DatabaseTriggersActionsContext.Provider
        value={{ refetchDatabaseTriggers }}
      >
        {children}
      </DatabaseTriggersActionsContext.Provider>
    </DatabaseTriggersStateContext.Provider>
  );
};

const useDatabaseTriggersState = () => {
  const context = React.useContext(DatabaseTriggersStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseTriggersState error");
  }

  return context;
};

const useDatabaseTriggersActions = () => {
  const context = React.useContext(DatabaseTriggersActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseTriggersActions error");
  }

  return context;
};

export {
  DatabaseTriggersActionsContext, DatabaseTriggersContextProvider, DatabaseTriggersStateContext,
  useDatabaseTriggersActions,
  useDatabaseTriggersState
};
