import React, { createContext, useContext } from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseNotificationsAPI } from "../../data/apis/databaseNotification";
import { useQuery } from "@tanstack/react-query";

const DatabaseNotificationsStateContext = React.createContext(undefined);
const DatabaseNotificationsActionsContext = React.createContext(undefined);

const DatabaseNotificationsContextProvider = ({ children }) => {
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingDatabaseNotifications,
    data: databaseNotifications,
    error: loadDatabaseNotificationsError,
    isFetching: isFetchingDatabaseNotifications,
    isRefetching: isRefetechingDatabaseNotifications,
    refetch: refetchDatabaseNotifications,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_NOTIFICATIONS(tenantID)],
    queryFn: () => getAllDatabaseNotificationsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });
  console.log({ databaseNotifications });
  return (
    <DatabaseNotificationsStateContext.Provider
      value={{
        databaseNotifications,
        isLoadingDatabaseNotifications,
        isFetchingDatabaseNotifications,
      }}
    >
      <DatabaseNotificationsActionsContext.Provider
        value={{ refetchDatabaseNotifications }}
      >
        {children}
      </DatabaseNotificationsActionsContext.Provider>
    </DatabaseNotificationsStateContext.Provider>
  );
};

const useDatabaseNotificationsState = () => {
  const context = React.useContext(DatabaseNotificationsStateContext);
  if (context === undefined) {
    throw new Error("useDatabaseNotificationsState error");
  }

  return context;
};

const useDatabaseNotificationsActions = () => {
  const context = React.useContext(DatabaseNotificationsActionsContext);
  if (context === undefined) {
    throw new Error("useDatabaseNotificationsActions error");
  }

  return context;
};

export {
  DatabaseNotificationsActionsContext, DatabaseNotificationsContextProvider, DatabaseNotificationsStateContext,
  useDatabaseNotificationsActions,
  useDatabaseNotificationsState
};
