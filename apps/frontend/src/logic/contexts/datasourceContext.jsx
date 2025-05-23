import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatasourcesAPI } from "../../data/apis/datasource";
import PropTypes from "prop-types";

const DatasourcesStateContext = React.createContext(undefined);
const DatasourcesActionsContext = React.createContext(undefined);
const DatasourcesContextProvider = ({ children }) => {
  DatasourcesContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();

  const {
    isLoading: isLoadingDatasources,
    data: datasources,
    error: loadDatasourcesError,
    isFetching: isFetchingDatasources,
    isRefetching: isRefetechingDatasources,
    refetch: refetchDatasources,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
    queryFn: () => getAllDatasourcesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });


  return (
    <DatasourcesStateContext.Provider
      value={{
        datasources,
        isLoadingDatasources,
        isFetchingDatasources,
        loadDatasourcesError,
        isRefetechingDatasources,
      }}
    >
      <DatasourcesActionsContext.Provider
        value={{ refetchDatasources}}
      >
        {children}
      </DatasourcesActionsContext.Provider>
    </DatasourcesStateContext.Provider>
  );
};

const useDatasourcesState = () => {
  const context = React.useContext(DatasourcesStateContext);
  if (context === undefined) {
    throw new Error("useDatasourcesState error");
  }

  return context;
};

const useDatasourcesActions = () => {
  const context = React.useContext(DatasourcesActionsContext);
  if (context === undefined) {
    throw new Error("useDatasourcesActions error");
  }

  return context;
};

export {
  DatasourcesActionsContext, DatasourcesContextProvider, DatasourcesStateContext,
  useDatasourcesActions,
  useDatasourcesState
};

