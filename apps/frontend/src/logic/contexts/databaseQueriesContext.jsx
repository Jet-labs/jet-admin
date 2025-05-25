import React from "react";
import { useParams } from "react-router-dom";
// import logo from "../../../assets/logo.png";

import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllDatabaseQueriesAPI } from "../../data/apis/databaseQuery";
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
        datasources,
        isLoadingDatasources,
        isFetchingDatasources,
        loadDatasourcesError,
        isRefetechingDatasources,
      }}
    >
      <DatabaseQueriesActionsContext.Provider
        value={{
          refetchDatabaseQueries,
          refetchDatabaseMetadata,
          refetchDatasources,
        }}
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

