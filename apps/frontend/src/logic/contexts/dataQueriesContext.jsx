import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";
import PropTypes from "prop-types";
import { getDatabaseMetadataAPI } from "../../data/apis/database";
import { getAllDatasourcesAPI } from "../../data/apis/datasource";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";

const DIRECT_QUERY_DATASOURCES = Object.keys(DATASOURCE_TYPES)
  .map((key) => {
    if (!DATASOURCE_UI_COMPONENTS[DATASOURCE_TYPES[key].value]) {
      return null;
    } else if (
      DATASOURCE_UI_COMPONENTS[DATASOURCE_TYPES[key].value].formConfig
    ) {
      return null;
    } else {
      return {
        value: DATASOURCE_TYPES[key].value,
        label: DATASOURCE_TYPES[key].name,
        type: DATASOURCE_TYPES[key].value,
      };
    }
  })
  .filter((v) => v != null);
const DataQueriesStateContext = React.createContext(undefined);
const DataQueriesActionsContext = React.createContext(undefined);
const DataQueriesContextProvider = ({ children }) => {
  DataQueriesContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();

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

  const {
    isLoading: isLoadingDatasources,
    data: _datasources,
    error: loadDatasourcesError,
    isFetching: isFetchingDatasources,
    isRefetching: isRefetechingDatasources,
    refetch: refetchDatasources,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID)],
    queryFn: () => getAllDatasourcesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const datasources =
    _datasources && _datasources.length > 0
      ? [
          ..._datasources.map((datasource) => {
            return {
              label: datasource.datasourceTitle,
              value: datasource.datasourceID,
              type: datasource.datasourceType,
            };
          }),
          ...DIRECT_QUERY_DATASOURCES,
        ]
      : [...DIRECT_QUERY_DATASOURCES];

  return (
    <DataQueriesStateContext.Provider
      value={{
        dataQueries,
        isLoadingDataQueries,
        isFetchingDataQueries,
        loadDataQueriesError,
        isRefetechingDataQueries,
        databaseMetadata,
        isLoadingDatabaseMetadata,
        isFetchingDatabaseMetadata,
        databaseMetadataError,
        isRefetchingDatabaseMetadata,
        datasources,
        isLoadingDatasources,
        isFetchingDatasources,
        loadDatasourcesError,
        isRefetechingDatasources,
      }}
    >
      <DataQueriesActionsContext.Provider
        value={{
          refetchDataQueries,
          refetchDatabaseMetadata,
          refetchDatasources,
        }}
      >
        {children}
      </DataQueriesActionsContext.Provider>
    </DataQueriesStateContext.Provider>
  );
};

const useDataQueriesState = () => {
  const context = React.useContext(DataQueriesStateContext);
  if (context === undefined) {
    throw new Error("useDataQueriesState error");
  }

  return context;
};

const useDataQueriesActions = () => {
  const context = React.useContext(DataQueriesActionsContext);
  if (context === undefined) {
    throw new Error("useDataQueriesActions error");
  }

  return context;
};

export {
  DataQueriesActionsContext, DataQueriesContextProvider, DataQueriesStateContext,
  useDataQueriesActions,
  useDataQueriesState
};

