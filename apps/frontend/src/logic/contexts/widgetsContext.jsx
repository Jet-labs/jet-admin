import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";
import { getAllWidgetsAPI } from "../../data/apis/widget";
import PropTypes from "prop-types";

const WidgetsStateContext = React.createContext(undefined);
const WidgetsActionsContext = React.createContext(undefined);
const WidgetsContextProvider = ({ children }) => {
  WidgetsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
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
  const {
    isLoading: isLoadingDataQueries,
    data: dataQueries,
    error: loadDataQueriesError,
    isFetching: isFetchingDataQueries,
    isRefetching: isRefetechingDataQueries,
    refetch: refetchDataQueries,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID)],
    queryFn: () => getAllDataQueriesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <WidgetsStateContext.Provider
      value={{
        widgets,
        isLoadingWidgets,
        isFetchingWidgets,
        loadWidgetsError,
        loadDataQueriesError,
        isRefetechingWidgets,
        isRefetechingDataQueries,
        dataQueries,
        isLoadingDataQueries,
        isFetchingDataQueries,
      }}
    >
      <WidgetsActionsContext.Provider
        value={{ refetchWidgets, refetchDataQueries }}
      >
        {children}
      </WidgetsActionsContext.Provider>
    </WidgetsStateContext.Provider>
  );
};

const useWidgetsState = () => {
  const context = React.useContext(WidgetsStateContext);
  if (context === undefined) {
    throw new Error("useWidgetsState error");
  }

  return context;
};

const useWidgetsActions = () => {
  const context = React.useContext(WidgetsActionsContext);
  if (context === undefined) {
    throw new Error("useWidgetsActions error");
  }

  return context;
};

export {
  WidgetsActionsContext,
  WidgetsContextProvider,
  WidgetsStateContext,
  useWidgetsActions,
  useWidgetsState,
};

