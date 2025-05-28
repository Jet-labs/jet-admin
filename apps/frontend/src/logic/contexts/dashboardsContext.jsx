import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../constants";
import { getAllDashboardsAPI } from "../../data/apis/dashboard";
import { getAllWidgetsAPI } from "../../data/apis/widget";

const DashboardsStateContext = React.createContext(undefined);
const DashboardsActionsContext = React.createContext(undefined);
const DashboardsContextProvider = ({ children }) => {
  DashboardsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingDashboards,
    data: dashboards,
    error: loadDashboardsError,
    isFetching: isFetchingDashboards,
    isRefetching: isRefetechingDashboards,
    refetch: refetchDashboards,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID)],
    queryFn: () => getAllDashboardsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingWidgets,
    data: widgets,
    error: loadWidgetsError,
    isFetching: isFetchingWidgets,
    isRefetching: isRefetechingWidgets,
    refetch: refetchWidgets,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
    queryFn: () => getAllWidgetsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <DashboardsStateContext.Provider
      value={{
        dashboards,
        isLoadingDashboards,
        isFetchingDashboards,
        loadDashboardsError,
        widgets,
        isLoadingWidgets,
        isFetchingWidgets,
        loadWidgetsError,
        isRefetechingDashboards,
        isRefetechingWidgets,
      }}
    >
      <DashboardsActionsContext.Provider
        value={{
          refetchDashboards,
          refetchWidgets,
        }}
      >
        {children}
      </DashboardsActionsContext.Provider>
    </DashboardsStateContext.Provider>
  );
};

const useDashboardsState = () => {
  const context = React.useContext(DashboardsStateContext);
  if (context === undefined) {
    throw new Error("useDashboardsState error");
  }

  return context;
};

const useDashboardsActions = () => {
  const context = React.useContext(DashboardsActionsContext);
  if (context === undefined) {
    throw new Error("useDashboardsActions error");
  }

  return context;
};

export {
  DashboardsActionsContext,
  DashboardsContextProvider,
  DashboardsStateContext,
  useDashboardsActions,
  useDashboardsState,
};

