import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseDashboardsAPI } from "../../data/apis/databaseDashboard";
import { getAllDatabaseWidgetsAPI } from "../../data/apis/databaseWidget";

const DatabaseDashboardsStateContext = React.createContext(undefined);
const DatabaseDashboardsActionsContext = React.createContext(undefined);
const DatabaseDashboardsContextProvider = ({ children }) => {
  DatabaseDashboardsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
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

  return (
    <DatabaseDashboardsStateContext.Provider
      value={{
        databaseDashboards,
        isLoadingDatabaseDashboards,
        isFetchingDatabaseDashboards,
        loadDatabaseDashboardsError,
        databaseWidgets,
        isLoadingDatabaseWidgets,
        isFetchingDatabaseWidgets,
        loadDatabaseWidgetsError,
        isRefetechingDatabaseDashboards,
        isRefetechingDatabaseWidgets,
      }}
    >
      <DatabaseDashboardsActionsContext.Provider
        value={{
          refetchDatabaseDashboards,
          refetchDatabaseWidgets,
        }}
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

