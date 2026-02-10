import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllDatabaseViewsAPI } from "../../data/apis/databaseView";
import PropTypes from "prop-types";

const DatabaseViewsStateContext = React.createContext(undefined);
const DatabaseViewsActionsContext = React.createContext(undefined);

const DatabaseViewsContextProvider = ({ children }) => {
  DatabaseViewsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingDatabaseViews,
    data: databaseViews,
    error: loadDatabaseViewsError,
    isFetching: isFetchingDatabaseViews,
    isRefetching: isRefetchingDatabaseViews,
    refetch: refetchDatabaseViews,
  } = useQuery({
    queryKey: ["DATABASE_VIEWS", tenantID, databaseSchemaName],
    queryFn: () => getAllDatabaseViewsAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });

  return (
    <DatabaseViewsStateContext.Provider
      value={{
        databaseViews,
        isLoadingDatabaseViews,
        isFetchingDatabaseViews,
        loadDatabaseViewsError,
        isRefetchingDatabaseViews,
      }}
    >
      <DatabaseViewsActionsContext.Provider
        value={{ refetchDatabaseViews }}
      >
        {children}
      </DatabaseViewsActionsContext.Provider>
    </DatabaseViewsStateContext.Provider>
  );
};

const useDatabaseViewsState = () => {
  const context = React.useContext(DatabaseViewsStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseViewsState must be used within DatabaseViewsContextProvider");
  }
  return context;
};

const useDatabaseViewsActions = () => {
  const context = React.useContext(DatabaseViewsActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseViewsActions must be used within DatabaseViewsContextProvider");
  }
  return context;
};

export {
  DatabaseViewsActionsContext,
  DatabaseViewsContextProvider,
  DatabaseViewsStateContext,
  useDatabaseViewsActions,
  useDatabaseViewsState
};
